import mongoose from "mongoose";

const DesignationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // The Child Admin that owns this designation. Each admin keeps its own set;
    // super-admin sees all. Null = legacy/global (visible only to super-admin).
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique per owner (so two admins can each have their own "Senior Designer").
DesignationSchema.index({ owner: 1, name: 1 }, { unique: true });

const Designation = mongoose.model("Designation", DesignationSchema);
export default Designation;
