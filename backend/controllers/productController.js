const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    const vendor = req.body.vendor || req.user?._id || req.user?.id;

    if (!name || !description || !price || !image || !vendor) {
      return res.status(400).json({
        message: "Name, description, price, image and vendor are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      image,
      category: category || "Uncategorized",
      stock: Math.max(Number(stock || 0), 0),
      vendor,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "vendor",
      "name email"
    );

    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "name email"
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const loggedUserId = req.user?._id || req.user?.id;

    if (
      String(product.vendor) !== String(loggedUserId) &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can update only your own products",
      });
    }

    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;

    if (req.body.price !== undefined) {
      product.price = Number(req.body.price);
    }

    product.image = req.body.image ?? product.image;
    product.category = req.body.category ?? product.category;

    if (req.body.stock !== undefined) {
      product.stock = Math.max(Number(req.body.stock), 0);
    }

    const updatedProduct = await product.save();

    const populatedProduct = await Product.findById(updatedProduct._id).populate(
      "vendor",
      "name email"
    );

    res.json(populatedProduct);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const loggedUserId = req.user?._id || req.user?.id;

    if (
      String(product.vendor) !== String(loggedUserId) &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can delete only your own products",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
