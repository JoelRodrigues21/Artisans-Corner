const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    default: 1,
  },

  price: {
    type: Number,
    required: true,
    default: 0,
  },

  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  platformFee: {
    type: Number,
    default: 0,
  },

  vendorPayout: {
    type: Number,
    default: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [orderProductSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    totalPlatformFee: {
      type: Number,
      default: 0,
    },

    totalVendorPayout: {
      type: Number,
      default: 0,
    },

    shippingAddress: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "Simulated Payment",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Paid",
    },

    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
