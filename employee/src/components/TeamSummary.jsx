import React from 'react';

// TODO: Replace with API call
// const teamData = [
const teamData = [
    {
        name: 'Riya Sharma',
        role: 'CAD Designer',
        image: '/Image/Riya Sharma.png',
        hours: '4:35:00'
    },
    {
        name: 'Riya Sharma',
        role: 'CAD Designer',
        image: '/Image/Riya Sharma.png',
        hours: '4:35:00'
    },
    {
        name: 'Riya Sharma',
        role: 'CAD Designer',
        image: '/Image/Riya Sharma.png',
        hours: '4:35:00'
    },
    {
        name: 'Riya Sharma',
        role: 'CAD Designer',
        image: '/Image/Riya Sharma.png',
        hours: '4:35:00'
    },
    {
        name: 'Riya Sharma',
        role: 'CAD Designer',
        image: '/Image/Riya Sharma.png',
        hours: '4:35:00'
    }
];

const TeamSummary = () => {
    return (
        <section className="ett-team-summary">
            <div className="ett-team-inner">
                <div className="ett-task-summary-heading">
                    <img src="/SVG/menu-css.svg" alt="meun" />
                    <p>Team Summary</p>
                </div>
                <div className="ett-task-detail cdl-task-details">
                    {teamData.map((member, index) => (
                        <div className="ett-task-summary-inner" key={index}>
                            <div className="ett-client-details">
                                <img src={member.image} alt="prn1" />
                                <div className="ett-client-name">
                                    <p>{member.name}</p>
                                    <span>{member.role}</span>
                                </div>
                            </div>
                            <div className="ett-client-working-time">
                                <p>Hours this week:</p>
                                <span>{member.hours}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TeamSummary;

