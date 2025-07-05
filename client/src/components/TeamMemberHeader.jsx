import React from 'react';
const TeamMemberHeader = () => {
    return (
        <section className="page2-main1">
            <div className="member-profile">
                <div className="mem-pro-vec">
                    <img src="/SVG/vec-mem-pro.svg" alt="vec" />
                    <span>Team Member Profile</span>
                </div>
                <div className="edit-profile">
                    <a href="EmployeeProfileEdit">
                        <img src="/SVG/edit-white.svg" alt="edit" />
                        Edit
                    </a>
                </div>
            </div>
        </section>
    );
};

export default TeamMemberHeader;

