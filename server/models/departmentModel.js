import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // The Child Admin that owns this department. Each admin keeps its own set;
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

// Unique per owner (so two admins can each have their own "CAD Design").
DepartmentSchema.index({ owner: 1, name: 1 }, { unique: true });

const Department = mongoose.model("Department", DepartmentSchema);
export default Department;
