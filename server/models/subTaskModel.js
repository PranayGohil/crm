import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user_type: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  text: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const stageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  completed_at: { type: Date, default: null },
});

const subTaskSchema = mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    task_name: String,
    description: String,
    url: String,
    stages: [stageSchema],
    total_price: { type: Number, default: 0 }, // sum of all stage prices
    earned_amount: { type: Number, default: 0 }, // sum of completed stage prices
    current_stage_index: { type: Number, default: 0 },
    priority: String,
    assign_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    assign_date: Date,
    due_date: Date,
    media_files: [String],
    path_to_files: String,
    status: String,
    comments: [commentSchema],
    time_logs: [
      {
        start_time: { type: Date },
        end_time: { type: Date, default: null },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Single indexes
subTaskSchema.index({ project_id: 1 }, { name: "idx_subtask_project" });
subTaskSchema.index({ assign_to: 1 }, { name: "idx_subtask_assignee" });
subTaskSchema.index({ status: 1 }, { name: "idx_subtask_status" });
subTaskSchema.index({ "stages.name": 1 }, { name: "idx_subtask_stage_name" });
subTaskSchema.index(
  { "stages.completed_by": 1 },
  { name: "idx_subtask_completed_by" }
);

// Compound indexes
subTaskSchema.index(
  { project_id: 1, status: 1 },
  { name: "idx_subtask_project_status" }
);

subTaskSchema.index(
  { project_id: 1, assign_to: 1 },
  { name: "idx_subtask_project_assignee" }
);

const SubTask = mongoose.model("Subtask", subTaskSchema);
export default SubTask;
