import React from 'react';

const MyTimeTracking = () => {
    return (
        <section className="ett-main-sec mg-auto">
            <div className="ett-emp-tracking-time">
                <div className="ett-tracking-time-heading">
                    <div className="ett-tracking-inner">
                        <h1>My Time Tracking</h1>
                        <p>Track your task time details by week or month.</p>
                    </div>
                </div>
                <div className="ett-time-duration">
                    <div className="ett-time-type">
                        <a href="#" className="ett-today">Today</a>
                        <a href="#">This Week</a>
                        <a href="#">This Month</a>
                    </div>
                    <div className="filter">
                        <a href="#">
                            <img src="/SVG/filter-vector.svg" alt="search" />
                            <span>Filters</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MyTimeTracking;
