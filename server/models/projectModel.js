import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
  project_name: {
    type: String,
  },
  tasks: {
    type: Array,
  },
  client_name: {
    type: String,
  },
  asign_to: [
    {
      role: {
        type: String,
      },
      id: {
        type: String,
      },
    },
  ],
  assign_date: {
    type: Date,
  },
  due_date: {
    type: Date,
  },
  priority: {
    type: String,
  },
  status: {
    type: String,
  },
});

const Project = mongoose.model("project", projectSchema);
export default Project;
