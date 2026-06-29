const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    addressLine: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    addresses: [addressSchema],

    role: {
      type: String,
      enum: ["buyer", "vendor", "admin"],
      default: "buyer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);