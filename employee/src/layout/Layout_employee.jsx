import React from "react";
import HeaderEmployee from "../components/HeaderEmployee";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom"; // For React Router v6+


const Layout_employee = () => {
    return (
        <div className="layout">
            {/* Sidebar */}
        

            {/* Main Section */}
            <div className="main-section">
                {/* Header */}
                <header>
                    <HeaderEmployee />
                </header>

                {/* Dynamic Page Content */}
                <main className="content">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer>
                    <Footer />
                </footer>
            </div>
        </div>
    );
};

export default Layout_employee;
