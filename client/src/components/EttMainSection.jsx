import React from 'react';

const EttMainSection = () => {
    return (
        <section className="ett-main-sec">
            <div className="tt-time-tracking ett-emp-tracking-time">
                <div className="ett-tracking-time-heading">
                    <div className="ett-tracking-inner">
                        <h1>Team Time Tracking</h1>
                        <p>Track time spent by your team across tasks and projects.</p>
                    </div>
                </div>
                <div className="ett-time-duration">
                    <div className="ett-time-type">
                        <a href="#" className="ett-today">Today</a>
                        <a href="#">This Week</a>
                        <a href="#">This Month</a>
                    </div>
                    <div className="filter">
                        <img src="/SVG/filter-vector.svg" alt="search" />
                        <span>Filters</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EttMainSection;
