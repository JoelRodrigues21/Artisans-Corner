const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const { buyer, products, totalAmount, shippingAddress } = req.body;

    if (!buyer || !products || products.length === 0 || !shippingAddress) {
      return res.status(400).json({
        message: "Buyer, products and shipping address are required",
      });
    }

    const orderProducts = [];
    const stockUpdates = [];

    let calculatedTotal = 0;
    let totalPlatformFee = 0;
    let totalVendorPayout = 0;

    for (const item of products) {
      const productId = item.product || item.productId || item._id;
      const quantity = Number(item.quantity || 1);

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const availableStock = Number(product.stock || 0);

      if (availableStock <= 0) {
        return res.status(400).json({
          message: `${product.name} is out of stock`,
        });
      }

      if (availableStock < quantity) {
        return res.status(400).json({
          message: `${product.name} has only ${availableStock} item(s) left in stock`,
        });
      }

      const price = Number(product.price || 0);
      const itemTotal = price * quantity;

      const platformFee = Number((itemTotal * 0.05).toFixed(2));
      const vendorPayout = Number((itemTotal - platformFee).toFixed(2));

      calculatedTotal += itemTotal;
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

      stockUpdates.push({
        productId: product._id,
        quantity,
      });
    }

    const order = await Order.create({
      buyer,
      products: orderProducts,
      totalAmount: calculatedTotal || totalAmount,
      totalPlatformFee,
      totalVendorPayout,
      shippingAddress,
      paymentMethod: "Demo Payment (Test Mode)",
      paymentStatus: "Paid",
      status: "Processing",
    });

    for (const item of stockUpdates) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("buyer", "name email phone role")
      .populate("products.product")
      .populate("products.vendor", "name email role");

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    let query = {};

    if (userRole === "buyer") {
      query = { buyer: userId };
    }

    if (userRole === "vendor") {
      query = { "products.vendor": userId };
    }

    const orders = await Order.find(query)
      .populate("buyer", "name email phone role")
      .populate("products.product")
      .populate("products.vendor", "name email role")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email phone role")
      .populate("products.product")
      .populate("products.vendor", "name email role");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const vendorOwnsOrder = order.products.some(
      (item) => String(item.vendor?._id || item.vendor) === String(userId)
    );

    if (userRole === "buyer") {
      return res.status(403).json({
        message: "Buyer cannot update order status",
      });
    }

    if (userRole === "vendor" && !vendorOwnsOrder) {
      return res.status(403).json({
        message: "You can update only your own product orders",
      });
    }

    if (userRole !== "admin" && userRole !== "vendor" && !vendorOwnsOrder) {
      return res.status(403).json({
        message: "Not allowed to update order status",
      });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("buyer", "name email phone role")
      .populate("products.product")
      .populate("products.vendor", "name email role");

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

const getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.user._id || req.user.id;

    const orders = await Order.find({
      "products.vendor": vendorId,
    })
      .populate("buyer", "name email")
      .populate("products.product")
      .populate("products.vendor", "name email")
      .sort({ createdAt: -1 });

    let totalSales = 0;
    let totalPlatformFee = 0;
    let totalVendorEarnings = 0;
    let totalProductsSold = 0;

    const salesHistory = [];

    orders.forEach((order) => {
      order.products.forEach((item) => {
        if (String(item.vendor?._id || item.vendor) === String(vendorId)) {
          const quantity = Number(item.quantity || 1);
          const price = Number(item.price || item.product?.price || 0);
          const itemTotal = price * quantity;

          totalSales += itemTotal;
          totalPlatformFee += Number(item.platformFee || itemTotal * 0.05);
          totalVendorEarnings += Number(item.vendorPayout || itemTotal * 0.95);
          totalProductsSold += quantity;

          salesHistory.push({
            orderId: order._id,
            productName: item.product?.name || "Product",
            quantity,
            price,
            itemTotal,
            platformFee: Number(item.platformFee || itemTotal * 0.05),
            vendorPayout: Number(item.vendorPayout || itemTotal * 0.95),
            buyerName: order.buyer?.name || "Buyer",
            status: order.status,
            date: order.createdAt,
          });
        }
      });
    });

    res.json({
      totalOrders: orders.length,
      totalProductsSold,
      totalSales,
      totalPlatformFee,
      totalVendorEarnings,
      salesHistory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch vendor analytics",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  getVendorAnalytics,
};