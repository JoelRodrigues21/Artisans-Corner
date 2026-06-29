const Review = require("../models/Review");

const createReview = async (req, res) => {
  try {
    const { product, user, rating, comment } = req.body;

    const review = await Review.create({
      product,
      user,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Review creation failed", error });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email")
      .populate("product", "name price");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to get reviews", error });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name price")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to get all reviews", error });
  }
};

const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error });
  }
};

module.exports = {
  createReview,
  getReviews,
  getAllReviews,
  deleteReview,
};