import React from 'react';

const TeamMemberCard = () => {
    return (
        <section className="page2-main2 tmp-main-inner">
            <div className="member-detail">
                <div className="sec1-color"></div>
                <div className="member1-data">
                    <div className="mem-img">
                        <img src="/Image/Riya Sharma.png" alt="prn1" />
                    </div>
                    <div className="mem-detail-txt">
                        <div className="mem-inf">
                            <div className="mem1-name">
                                <p>Riya Sharma</p>
                                <span>CAD Designer</span>
                            </div>
                            <div className="active-prn-activity">
                                <img src="/SVG/dot.svg" alt="dot" />
                                <p>Active</p>
                            </div>
                        </div>
                        <div className="time-tracker">
                            <img src="/SVG/time.svg" alt="time" />
                            <a href="employeetimetracking">View Time Tracking</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TeamMemberCard;
