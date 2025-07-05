import React from "react";

const ClientAdminDetails = () => {
    // TODO: Replace with API call
    /*
    const clientInfo = {
      personal: {
        username: "John Doe",
        email: "riya.sharma@email.com",
        phone: "+91 9876543210",
        joiningDate: "24 May 2025",
        address: "Street, City, State, ZIP Code",
        preferredContact: "Email",
        clientType: "VIP"
      },
      company: {
        name: "Acme Corporation",
        gst: "GST12345678XYZ",
        website: "www.acmecorp.com",
        linkedin: "linkedin.com/company/acmecorp",
        notes:
          "Client prefers communication in the morning. Has a specific requirement for project deliverables."
      }
    };
    */

    return (
        <section className="mi_24">
            <div className="cdl-sec2">
                <div className="cdl-sec2-inn">
                    <div className="cdl-sec2-inner1">
                        <div className="cdl-sec2-heading">
                            <p> Contact & Identity Information</p>
                        </div>
                        <div className="cdl-inf-1">
                            <div className="cnc-ci">
                                <div className="ci-inner cnc-fullname cnc-css">
                                    <span>Username</span>
                                    <p>John Doe</p>
                                </div>
                                <div className="ci-inner cnc-email cnc-css">
                                    <span>Email Address</span>
                                    <p>riya.sharma@email.com</p>
                                </div>
                            </div>
                            <div className="cnc-ci">
                                <div className="ci-inner cnc-phone cnc-css">
                                    <span>Phone Number</span>
                                    <p>+91 9876543210</p>
                                </div>
                                <div className="ci-inner cnc-join-date cnc-css">
                                    <span>Joining Date </span>
                                    <p>24 May 2025</p>
                                </div>
                            </div>
                            <div className="ci-inner cnc-add cnc-css">
                                <span>Address </span>
                                <p>Street, City, State, ZIP Code</p>
                            </div>
                            <div className="cdl-email-type cnc-ci">
                                <div className="ci-inner cnc-add cnc-css">
                                    <span>Preferred Contact Method</span>
                                    <p>Email</p>
                                </div>
                                <div className="ci-inner cnc-add cnc-css">
                                    <span>Client Type</span>
                                    <div className="cdl-client_type">
                                        <span>VIP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="cdl-sec2-inner2">
                        <div className="cdl-sec2-heading">
                            <p> Contact & Identity Information</p>
                        </div>
                        <div className="cdl-inf-1">
                            <div className="ci-inner cnc-fullname cnc-css">
                                <span>Company Name</span>
                                <p>Acme Corporation</p>
                            </div>
                            <div className="ci-inner cnc-email cnc-css">
                                <span>GST / VAT Number</span>
                                <p>GST12345678XYZ</p>
                            </div>
                            <div className="ci-inner cnc-phone cnc-css">
                                <span>Website</span>
                                <a href="#">www.acmecorp.com</a>
                            </div>
                            <div className="ci-inner cnc-join-date cnc-css">
                                <span>linkedin</span>
                                <a href="#">linkedin.com/company/acmecorp</a>
                            </div>
                            <div className="ci-inner cnc-add cnc-css">
                                <span>Additional Notes</span>
                                <p>
                                    Client prefers communication in the morning. Has a specific
                                    requirement for project deliverables.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ClientAdminDetails;
