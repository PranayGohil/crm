import React from "react";
import TeamMembersHeader from "../components/TeamMembersHeader";
import TeamMemberStats from "../components/TeamMemberStats";
import TeamMemberCards from "../components/TeamMemberCards";
import TeamMembersCount from "../components/TeamMembersCount";

const TeamMemberDashboard = () => {
    return (
        <section className="team_member_dashboard">
            <TeamMembersHeader />
            <TeamMemberStats />
            <TeamMemberCards />
            <TeamMembersCount />
        </section>
    );
};

export default TeamMemberDashboard;
