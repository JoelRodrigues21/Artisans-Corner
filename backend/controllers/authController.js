const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const formatUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    addresses: user.addresses || [],
    role: user.role,
  };
};

const register = async (req, res) => {
  try {
    const { name, email, phone, gender, password, role } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({
        message: "Email or phone number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      phone,
      gender,
      password: hashedPassword,
      role: role || "buyer",
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      $or: [{ email }, { phone: email }],
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email/phone or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email/phone or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({
      message: "Failed to get profile",
      error,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });

      if (phoneExists) {
        return res.status(400).json({
          message: "Phone number already exists",
        });
      }

      user.phone = phone;
    }

    await user.save();

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
      error,
    });
  }
};

const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.addresses.length === 0 || req.body.isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });

      req.body.isDefault = true;
    }

    user.addresses.push(req.body);

    await user.save();

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({
      message: "Address add failed",
      error,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== req.params.addressId
    );

    if (
      user.addresses.length > 0 &&
      !user.addresses.some((address) => address.isDefault)
    ) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({
      message: "Address delete failed",
      error,
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.addresses.forEach((address) => {
      address.isDefault =
        address._id.toString() === req.params.addressId;
    });

    await user.save();

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({
      message: "Default address update failed",
      error,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can view users",
      });
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get users",
      error,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete users",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  getUsers,
  deleteUser,
};