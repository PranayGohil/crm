import React from "react";

const ClientDetails = ({ client }) => {
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
                  <p>{client.username}</p>
                </div>
                <div className="ci-inner cnc-email cnc-css">
                  <span>Email Address</span>
                  <p>{client.email}</p>
                </div>
              </div>
              <div className="cnc-ci">
                <div className="ci-inner cnc-phone cnc-css">
                  <span>Phone Number</span>
                  <p>{client.phone}</p>
                </div>
                <div className="ci-inner cnc-join-date cnc-css">
                  <span>Joining Date</span>
                  <p>{new Date(client.joining_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="ci-inner cnc-add cnc-css">
                <span>Address</span>
                <p>{client.address}</p>
              </div>
              <div className="cdl-email-type cnc-ci">
                <div className="ci-inner cnc-add cnc-css">
                  <span>Preferred Contact Method</span>
                  <p>Email</p> {/* Change if you have real data */}
                </div>
                <div className="ci-inner cnc-add cnc-css">
                  <span>Client Type</span>
                  <div className="cdl-client_type">
                    <span>{client.client_type}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cdl-sec2-inner2">
            <div className="cdl-sec2-heading">
              <p> Company Information</p>
            </div>
            <div className="cdl-inf-1">
              <div className="ci-inner cnc-fullname cnc-css">
                <span>Company Name</span>
                <p>{client.company_name}</p>
              </div>
              <div className="ci-inner cnc-email cnc-css">
                <span>GST / VAT Number</span>
                <p>{client.gst_number}</p>
              </div>
              <div className="ci-inner cnc-phone cnc-css">
                <span>Website</span>
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {client.website}
                </a>
              </div>
              <div className="ci-inner cnc-join-date cnc-css">
                <span>LinkedIn</span>
                <a
                  href={client.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {client.linkedin}
                </a>
              </div>
              <div className="ci-inner cnc-add cnc-css">
                <span>Additional Notes</span>
                <p>{client.additional_notes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientDetails;
