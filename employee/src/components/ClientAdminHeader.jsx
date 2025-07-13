import React from "react";

const ClientAdminHeader = () => {
    // TODO: Replace with API call
    /*
    const client = {
      name: "John Doe",
      status: "Active",
      clientId: "#CL-7890",
      editLink: "#",
      editIcon: "/SVG/edit-white.svg",
      statusIcon: "/SVG/dot.svg"
    };
    */

    return (
        <section className="cdl-main_main_inner">
            <div className="cdl-main">
                <div className="cdl-main-inner cnc-sec2-inner edit_admin">
                    <h1>Welcome Back :- John Doe</h1>
                    <div className="cnc-active">
                        <div className="active-prn-activity">
                            <img src="/SVG/dot.svg" alt="dot" />
                            <p>Active</p>
                        </div>
                        <p>
                            Client ID: <span> #CL-7890</span>
                        </p>
                    </div>
                </div>
                <div className="edit-profile">
                    <a href="ClientAdminProjectDetails" className="edit_admin">
                        View Project
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ClientAdminHeader;
