// controllers/adminController.js
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import cloudinary from "../config/cloudinary.js";

// Generate JWT Token
const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: admin.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Middleware to check if user is super-admin
export const isSuperAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin privileges required."
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by either username OR email
    const admin = await Admin.findOne({
      $or: [{ email: email }, { username: email }],
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // If passwords are hashed, compare with bcrypt
    // const isMatch = await bcrypt.compare(password, admin.password);
    // if (!isMatch) {
    //   return res.status(400).json({ message: "Invalid credentials" });
    // }

    if (password !== admin.password)
      return res.status(400).json({ message: "Invalid credentials" });

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin);

    res.json({
      token,
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        profile_pic: admin.profile_pic,
        role: admin.role
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all admins (super-admin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .populate('createdBy', 'username email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      admins
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create new admin (super-admin only)
export const createAdmin = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email or username already exists"
      });
    }

    // Handle profile picture if uploaded
    let profilePicData = {};
    if (req.file) {
      profilePicData = {
        profile_pic: req.file.path,
        profile_pic_public_id: req.file.filename
      };
    }

    // Create new admin (always create as 'admin' role, never as super-admin)
    const newAdmin = new Admin({
      username,
      email,
      password,
      phone,
      role: 'admin', // Always set to admin when creating new
      createdBy: req.user.id,
      ...profilePicData
    });

    await newAdmin.save();

    // Remove password from response
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: adminResponse
    });

  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update admin (super-admin only)
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, isActive } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Prevent super-admin from being modified (for safety)
    if (admin.role === 'super-admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot modify super admin account"
      });
    }

    // Update fields
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (typeof isActive === 'boolean') admin.isActive = isActive;

    if (req.file) {
      // Delete old Cloudinary image
      if (admin.profile_pic_public_id) {
        await cloudinary.uploader.destroy(admin.profile_pic_public_id);
      }
      admin.profile_pic = req.file.path;
      admin.profile_pic_public_id = req.file.filename;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin updated successfully"
    });

  } catch (err) {
    console.error("Update admin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete admin (super-admin only)
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Prevent deleting super-admin
    if (admin.role === 'super-admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin account"
      });
    }

    // Delete profile picture from Cloudinary
    if (admin.profile_pic_public_id) {
      await cloudinary.uploader.destroy(admin.profile_pic_public_id);
    }

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully"
    });

  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get current admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    res.status(200).json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update current admin profile (any admin can update their own profile)
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    const { username, email, phone, password } = req.body;

    // Don't allow role change through profile update
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;

    if (password) admin.password = password;

    if (req.file) {
      if (admin.profile_pic_public_id) {
        await cloudinary.uploader.destroy(admin.profile_pic_public_id);
      }
      admin.profile_pic = req.file.path;
      admin.profile_pic_public_id = req.file.filename;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// Get admin profile for employees (public view - shows super-admin by default)
export const adminProfileForEmployee = async (req, res) => {
  try {
    // Get the super-admin for public view
    const fetchAdmin = await Admin.findOne({ role: 'super-admin' });
    if (!fetchAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    const admin = {
      _id: fetchAdmin._id,
      username: fetchAdmin.username,
      email: fetchAdmin.email,
      profile_pic: fetchAdmin.profile_pic,
    };

    res.status(200).json({ success: true, admin });
  } catch (err) {
    console.error("Get admin profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};