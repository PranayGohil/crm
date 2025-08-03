// models/Admin.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  phone: String,
  profile_pic: String,
  profile_pic_public_id: String,
});

export default mongoose.model("Admin", adminSchema);
