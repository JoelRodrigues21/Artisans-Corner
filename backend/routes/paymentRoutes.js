const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

let stripe = null;

if (
  process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY.startsWith("sk_")
) {
  try {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  } catch (error) {
    stripe = null;
  }
}

const COMMISSION_RATE = 0.05;

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      _id: decoded.id || decoded._id || decoded.userId,
    };

    if (!req.user._id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const prepareOrderData = async (products) => {
  let orderProducts = [];
  let lineItems = [];
  let totalAmount = 0;
  let totalPlatformFee = 0;
  let totalVendorPayout = 0;

  for (const item of products) {
    const productId = item.productId || item.product || item._id;
    const quantity = Number(item.quantity || 1);

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const stockCount = Number(product.stock || 0);

    if (stockCount <= 0) {
      throw new Error(`${product.name} is out of stock`);
    }

    if (stockCount < quantity) {
      throw new Error(`${product.name} has only ${stockCount} item(s) left`);
    }

    const price = Number(product.price || 0);
    const itemTotal = price * quantity;

    const platformFee = Math.round(itemTotal * COMMISSION_RATE);
    const vendorPayout = itemTotal - platformFee;

    totalAmount += itemTotal;
    totalPlatformFee += platformFee;
    totalVendorPayout += vendorPayout;

    orderProducts.push({
      product: product._id,
      quantity,
      price,
      vendor: product.vendor,
      platformFee,
      vendorPayout,
    });

    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
          description: product.description || "Handmade product",
        },
        unit_amount: Math.round(price * 100),
      },
      quantity,
    });
  }

  return {
    orderProducts,
    lineItems,
    totalAmount,
    totalPlatformFee,
    totalVendorPayout,
  };
};

const reduceStock = async (orderProducts) => {
  for (const item of orderProducts) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -Number(item.quantity || 1) },
    });
  }
};

router.post("/demo-payment", protect, async (req, res) => {
  try {
    const { products, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const {
      orderProducts,
      totalAmount,
      totalPlatformFee,
      totalVendorPayout,
    } = await prepareOrderData(products);

    const order = await Order.create({
      buyer: req.user._id,
      products: orderProducts,
      totalAmount,
      totalPlatformFee,
      totalVendorPayout,
      shippingAddress,
      paymentMethod: "Demo Stripe Payment",
      paymentStatus: "Paid",
      status: "Processing",
    });

    await reduceStock(orderProducts);

    res.status(201).json({
      message: "Demo payment successful. Order placed.",
      order,
    });
  } catch (error) {
    console.log("Demo payment error:", error);

    res.status(500).json({
      message: error.message || "Demo payment failed",
    });
  }
});

router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({
        message:
          "Stripe key is not configured. Use Demo Payment for presentation.",
      });
    }

    const { products, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const {
      orderProducts,
      lineItems,
      totalAmount,
      totalPlatformFee,
      totalVendorPayout,
    } = await prepareOrderData(products);

    const order = await Order.create({
      buyer: req.user._id,
      products: orderProducts,
      totalAmount,
      totalPlatformFee,
      totalVendorPayout,
      shippingAddress,
      paymentMethod: "Stripe Checkout",
      paymentStatus: "Pending",
      status: "Processing",
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout`,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
      },
    });

    res.status(200).json({
      url: session.url,
      orderId: order._id,
    });
  } catch (error) {
    console.log("Stripe checkout error:", error);

    res.status(500).json({
      message: error.message || "Payment session creation failed",
    });
  }
});

router.get("/verify-payment", protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({
        message: "Stripe key is not configured.",
      });
    }

    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID not found" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (session.payment_status !== "paid") {
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(400).json({
        message: "Payment not completed",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        message: "Payment already verified",
        order,
      });
    }

    await reduceStock(order.products);

    order.paymentStatus = "Paid";
    order.paymentMethod = "Stripe Checkout";
    order.status = "Processing";

    await order.save();

    res.status(200).json({
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.log("Payment verification error:", error);

    res.status(500).json({
      message: error.message || "Payment verification failed",
    });
  }
});

module.exports = router;