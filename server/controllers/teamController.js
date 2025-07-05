import Team from "../models/teamModel.js";

export const addTeam = async (req, res) => {
    const { team_name, team_members } = req.body;
    const team = await Team.create({
        team_name,
        team_members,
    });
    res.status(200).json(team);
};

export const getTeams = async (req, res) => {
    const teams = await Team.find();
    res.status(200).json(teams);
};

export const getTeam = async (req, res) => {
    const { id } = req.params;
    const team = await Team.findById(id);
    res.status(200).json(team);
}

export const updateTeam = async (req, res) => {
    const { id } = req.params;
    const { team_name, team_members } = req.body;
    const team = await Team.findByIdAndUpdate(id, {
        team_name,
        team_members,
    });
    res.status(200).json(team);
};

export const deleteTeam = async (req, res) => {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);
    res.status(200).json(team);
};