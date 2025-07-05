import React from "react";

const CreateClientHeader = () => {
    return (
        <section className="cnc-first cd-client_dashboard header header_back_arrow">
            <a href="#">
                <img src="/SVG/arrow-pc.svg" alt="" className="back_arrow" />
            </a>
            <div className="cnc-first-inner cd-head-menu head-menu">
                <h1>Create New Client</h1>
                <p>Add a new client to your dashboard</p>
            </div>
        </section>
    );
};

export default CreateClientHeader;
