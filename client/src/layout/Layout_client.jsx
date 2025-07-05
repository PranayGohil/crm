import React from "react";
import HeaderClient from "../components/HeaderClient";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom"; // For React Router v6+

const Layout_client = () => {
    return (
        <div className="layout">
            {/* Sidebar */}
        

            {/* Main Section */}
            <div className="main-section">
                {/* Header */}
                <header>
                    <HeaderClient />
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

export default Layout_client;
