import mongoose from "mongoose";

const DesignationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Designation = mongoose.model("Designation", DesignationSchema);
export default Designation;
