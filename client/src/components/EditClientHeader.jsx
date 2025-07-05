import React from "react";

const EditClientHeader = () => {
    return (
        <section className="cnc-first cd-client_dashboard header header_back_arrow">
            <a href="#">
                <img src="/SVG/arrow-pc.svg" alt="" className="back_arrow" />
            </a>
            <div className="cnc-first-inner cd-head-menu head-menu">
                <h1>Edit Client</h1>
                <p>Update client details in your dashboard</p>
            </div>
        </section>
    );
};

export default EditClientHeader;
