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

// Single indexes
projectSchema.index({ isArchived: 1 }, { name: "idx_project_archived" });
projectSchema.index({ client_id: 1 }, { name: "idx_project_client" });
projectSchema.index({ status: 1 }, { name: "idx_project_status" });
projectSchema.index({ priority: 1 }, { name: "idx_project_priority" });

// Text search index
projectSchema.index(
  { project_name: "text" },
  {
    name: "idx_project_name_text",
    default_language: "english",
  }
);

// Compound index
projectSchema.index(
  { isArchived: 1, client_id: 1 },
  { name: "idx_project_archived_client" }
);


const Project = mongoose.model("Project", projectSchema);
export default Project;
