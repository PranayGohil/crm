import React from "react";

const SubtaskManagementHeader = () => {
    return (
        <section className="sms-subtask-mng-header mg-auto">
            <div className="sms-header-inner">
                <div className="sms-heading-main">
                    <a href="#"><img src="/SVG/arrow-pc.svg" alt="" /></a>
                    <div className="sms-heading-txt">
                        <h1>Subtask Management (1.for Edit,and one subtask create)</h1>
                        <div className="sms-client-inf">
                            <span>Client: Luxe Jewelry Co.</span>
                            <span>• May 15, 2023 - July 30, 2023</span>
                        </div>
                    </div>
                </div>
                <div className="sms-all_task-btn">
                    <a href="#">See All Subtask</a>
                </div>
            </div>
        </section>
    );
};

export default SubtaskManagementHeader;
