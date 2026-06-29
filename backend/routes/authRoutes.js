const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  getUsers,
  deleteUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

router.post("/addresses", protect, addAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.put("/addresses/:addressId/default", protect, setDefaultAddress);

router.get("/users", protect, getUsers);
router.delete("/users/:id", protect, deleteUser);

module.exports = router;