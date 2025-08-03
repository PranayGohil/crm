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

const subTaskSchema = mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    task_name: {
      type: String,
    },
    description: {
      type: String,
    },
    url: {
      type: String,
    },
    stage: {
      type: [String],
    },
    current_stage_index: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
    },
    assign_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    assign_date: {
      type: Date,
    },
    due_date: {
      type: Date,
    },
    media_files: [
      {
        type: String,
      },
    ],
    path_to_files: {
      type: String,
    },
    status: {
      type: String,
    },
    comments: [commentSchema],
    time_logs: [
      {
        start_time: { type: Date },
        end_time: { type: Date, default: null },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SubTask = mongoose.model("Subtask", subTaskSchema);
export default SubTask;
