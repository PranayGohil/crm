import mongoose from "mongoose";

const clientScheme = mongoose.Schema({
  full_name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  joining_date: {
    type: Date,
  },
  address: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true, // enforce unique at database level
    trim: true,
  },
  client_type: {
    type: String,
  },
  password: {
    type: String,
  },
  company_name: {
    type: String,
  },
  gst_number: {
    type: String,
  },
  business_phone: {
    type: String,
  },
  website: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  business_address: {
    type: String,
  },
  additional_notes: {
    type: String,
  },
  stage_pricing: [
    {
      stage_name: {
        type: String,
        enum: ["CAD Design", "SET Design", "Render", "QC", "Delivery"],
      },
      price: {
        type: Number,
        default: 0,
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Client = mongoose.model("Client", clientScheme);
export default Client;
