import mongoose from "mongoose";

const subTaskSchema = mongoose.Schema({
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
  stage: {
    type: String,
  },
  priority: {
    type: String,
  },
  asign_to: [
    {
      role: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    },
  ],
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
});

const SubTask = mongoose.model("subtask", subTaskSchema);
export default SubTask;
