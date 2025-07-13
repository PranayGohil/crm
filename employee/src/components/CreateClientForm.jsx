import React from "react";

// TODO: Replace with API call
// const dropdownOptions = ["In progress", "To do", "Pause", "Block", "Done"];

const CreateClientForm = () => {
    return (
        <section className="cnc-sec2">
            <div className="cnc-sec2-inner">
                <div className="cnc-heading1">
                    <p>Client Information</p>
                </div>
                <div className="cnc-client-inf">
                    <div className="cnc-ci">
                        <div className="ci-inner cnc-fullname cnc-css">
                            <p>Full Name </p>
                            <input type="text" placeholder="e.g., John Doe" />
                        </div>
                        <div className="ci-inner cnc-email cnc-css">
                            <p>Email Address </p>
                            <input type="email" placeholder="e.g., john@example.com" />
                        </div>
                    </div>
                    <div className="cnc-ci">
                        <div className="ci-inner cnc-phone cnc-css">
                            <p>Phone Number </p>
                            <input type="number" placeholder="e.g., +91 9876543210" />
                        </div>
                        <div className="ci-inner cnc-join-date cnc-css">
                            <p>Joining Date </p>
                            <input type="date" />
                        </div>
                    </div>
                    <div className="cnc-add cnc-css">
                        <p>Address </p>
                        <input type="text" placeholder="Street, City, State, ZIP Code" />
                    </div>
                </div>
            </div>

            <div className="cnc-sec2-inner">
                <div className="cnc-heading1">
                    <p>Account Credentials</p>
                </div>
                <div className="cnc-client-inf">
                    <div className="cnc-ci">
                        <div className="ci-inner cnc-fullname cnc-css">
                            <p>Username </p>
                            <input type="text" placeholder="e.g., John.Doe" />
                        </div>
                        <div className="ci-inner cnc-email">
                            <div className="cnc-btn_main btn_main1">
                                <p>Client Type / Category </p>
                                <div className="cnc-dropdown-t dropdown_toggle1">
                                    <div className="cnc-tb-inner t-b-inner">
                                        <span className="cnc-txt-btn text_btn1">Select client type</span>
                                        <img src="/SVG/arrow-grey.svg" alt="vec" className="arrow_icon1" />
                                    </div>
                                </div>
                                <ul className="dropdown_menu1">
                                    {/* TODO: Replace with API call */}
                                    {/* {dropdownOptions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))} */}
                                    <li>In progress</li>
                                    <li>To do</li>
                                    <li>Pause</li>
                                    <li>Block</li>
                                    <li>Done</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="cnc-ci">
                        <div className="ci-inner cnc-phone cnc-css">
                            <p>Password </p>
                            <input type="number" placeholder="e.g., +91 9876543210" />
                        </div>
                        <div className="ci-inner cnc-join-date cnc-css">
                            <p>Confirm Password </p>
                            <input type="date" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="cnc-sec2-inner">
                <div className="cnc-heading1">
                    <p>Additional Details (Optional)</p>
                </div>
                <div className="cnc-client-inf">
                    <div className="cnc-ci">
                        <div className="cnc-part3 ci-inner cnc-fullname cnc-css">
                            <p>Company Name </p>
                            <input type="text" placeholder="Amore Corporation" />
                        </div>
                        <div className="cnc-part3 ci-inner cnc-email cnc-css">
                            <p>GST / VAT Number</p>
                            <input type="email" placeholder="GST1234567ABC" />
                        </div>
                    </div>
                    <div className="cnc-ci">
                        <div className="cnc-part3 ci-inner cnc-phone cnc-css">
                            <p>Business Phone</p>
                            <input type="number" placeholder="+91 9876543210" />
                        </div>
                        <div className="cnc-part3 ci-inner cnc-join-date cnc-css">
                            <p>JWebsite </p>
                            <input type="#" placeholder="https://www.amorecorp.com" />
                        </div>
                    </div>
                    <div className="cnc-part3 cnc-add cnc-css">
                        <p>LinkedIn</p>
                        <input type="text" placeholder="https://linkedin.com/company/amorecorp" />
                    </div>
                    <div className="cnc-part3 cnc-add cnc-css">
                        <p>Business Address</p>
                        <input type="text" placeholder="789 Market Street, Suite 101, NY, USA" />
                    </div>
                    <div className="cnc-part3 cnc-add cnc-css">
                        <p>Additional Notes</p>
                        <input
                            type="text"
                            placeholder="Client prefers email communication.Quarterly billing cycle. Special discount of 10% on all services as per agreement signed on Jan 15, 2023."
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CreateClientForm;
