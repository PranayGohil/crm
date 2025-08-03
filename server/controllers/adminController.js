import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import cloudinary from "../config/cloudinary.js";

// admin login controller
export const adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.json({ email, token, role: "admin" }); // add role here
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne(); // Assuming single admin
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    res.status(200).json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    const { username, email, phone, password } = req.body;

    admin.username = username;
    admin.email = email;
    admin.phone = phone;
    if (password) admin.password = password;

    if (req.file) {
      // Optionally delete old Cloudinary image
      if (admin.profile_pic_public_id) {
        await cloudinary.uploader.destroy(admin.profile_pic_public_id);
      }

      admin.profile_pic = req.file.path; // secure_url from Cloudinary
      admin.profile_pic_public_id = req.file.filename; // public_id from multer-storage-cloudinary
    }

    await admin.save();
    res
      .status(200)
      .json({ success: true, message: "Admin updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};
