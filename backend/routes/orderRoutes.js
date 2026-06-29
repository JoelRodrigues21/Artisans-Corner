const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getVendorAnalytics,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/vendor/analytics", protect, getVendorAnalytics);

module.exports = router;
