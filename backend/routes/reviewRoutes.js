const express = require("express");

const router = express.Router();

const {
  createReview,
  getReviews,
  getAllReviews,
  deleteReview,
} = require("../controllers/reviewController");

router.post("/", createReview);

router.get("/all", getAllReviews);

router.get("/:productId", getReviews);

router.delete("/:id", deleteReview);

module.exports = router;