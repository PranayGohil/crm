import mongoose from "mongoose";

const teamSchema = mongoose.Schema({
  team_name: {
    type: String,
  },
  team_members: [
    {
      role: {
        type: String,
      },
      id: {
        type: String,
      },
    },
  ],
});

const Team = mongoose.model("team", teamSchema);
export default Team;
