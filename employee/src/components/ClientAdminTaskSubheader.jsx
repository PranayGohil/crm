import React from 'react';

const ClientAdminTaskSubheader = () => {
    return (
        <section className="pb-sec-3 pb-sec2">
            <div className="pb-sec3-inner">
                <div className="pb-client-id">
                    <div className="pb-pro-client pb-project-id">
                        <p>Project ID: </p>
                        <span> JWL-2023-089</span>
                    </div>
                    <div className="pb-pro-client pb-client">
                        <p>Client: </p>
                        <span> Sarah Johnson</span>
                    </div>
                </div>
                <div className="pb-subtask-process">
                    <a href="#" className="cdn-bg-color-yellow color_yellow">In Progress</a>
                    <a href="#" className="cdn-bg-color-red color_red">High Priority</a>
                </div>
            </div>
        </section>
    );
};

export default ClientAdminTaskSubheader;
