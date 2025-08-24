import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
  {
    project_name: String,
    client_id: String,
    assign_to: [
      {
        role: String,
        id: String,
      },
    ],
    assign_date: Date,
    due_date: Date,
    priority: String,
    status: String,
    description: String,

    content: [
      {
        items: [
          {
            name: String,
            quantity: Number,
            price: Number,
          },
        ],
        total_price: Number,
        uploaded_files: [String],
        description: String,
        currency: String,
      },
    ],
    
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
