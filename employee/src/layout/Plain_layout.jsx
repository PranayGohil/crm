import React from "react";
import { Outlet } from "react-router-dom"; // For React Router v6+


const Plain_layout = () => {
    return (
        <div className="layout">
            {/* Sidebar */}


            {/* Main Section */}
            <div className="main-section">
                {/* Header */}


                {/* Dynamic Page Content */}
                <main className="content">
                    <Outlet />
                </main>

                {/* Footer */}

            </div>
        </div>
    );
};

export default Plain_layout;
