import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ClientFormEdit = ({ client }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    joinDate: "",
    address: "",
    username: "",
    clientType: "",
    companyName: "",
    gstNumber: "",
    businessPhone: "",
    website: "",
    linkedin: "",
    businessAddress: "",
    additionalNotes: "",
  });

  // Populate form when client data is loaded
  useEffect(() => {
    if (client) {
      setForm({
        fullName: client.full_name || "",
        email: client.email || "",
        phone: client.phone || "",
        joinDate: client.joining_date
          ? client.joining_date.substring(0, 10)
          : "",
        address: client.address || "",
        username: client.username || "",
        clientType: client.client_type || "",
        companyName: client.company_name || "",
        gstNumber: client.gst_number || "",
        businessPhone: client.business_phone || "",
        website: client.website || "",
        linkedin: client.linkedin || "",
        businessAddress: client.business_address || "",
        additionalNotes: client.additional_notes || "",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      // Map camelCase → snake_case
      const payload = {
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        joining_date: form.joinDate,
        address: form.address,
        username: form.username,
        client_type: form.clientType,
        company_name: form.companyName,
        gst_number: form.gstNumber,
        business_phone: form.businessPhone,
        website: form.website,
        linkedin: form.linkedin,
        business_address: form.businessAddress,
        additional_notes: form.additionalNotes,
      };

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/client/update-username/${id}`,
        payload
      );

      alert("Client updated successfully!");
      navigate("/clientdetailspage/" + res.data.username);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update client.");
    }
  };

  return (
    <>
      <section className="cnc-sec2">
        {/* Client Information */}
        <div className="cnc-sec2-inner">
          <div className="cnc-heading1">
            <p>Client Information</p>
          </div>
          <div className="cnc-client-inf">
            <div className="cnc-ci">
              <div className="ci-inner cnc-fullname cnc-css">
                <p>Full Name</p>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="ci-inner cnc-email cnc-css">
                <p>Email Address</p>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="cnc-ci">
              <div className="ci-inner cnc-phone cnc-css">
                <p>Phone Number</p>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="ci-inner cnc-join-date cnc-css">
                <p>Joining Date</p>
                <input
                  type="date"
                  name="joinDate"
                  value={form.joinDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="cnc-add cnc-css">
              <p>Address</p>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Account Credentials */}
        <div className="cnc-sec2-inner">
          <div className="cnc-heading1">
            <p>Account Credentials</p>
          </div>
          <div className="cnc-client-inf">
            <div className="cnc-ci">
              <div className="ci-inner cnc-fullname cnc-css">
                <p>Username</p>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              <div className="ci-inner cnc-fullname cnc-css">
                <p>Client Type / Category</p>
                <input
                  type="text"
                  name="clientType"
                  value={form.clientType}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="cnc-sec2-inner">
          <div className="cnc-heading1">
            <p>Additional Details (Optional)</p>
          </div>
          <div className="cnc-client-inf">
            <div className="cnc-ci">
              <div className="ci-inner cnc-fullname cnc-css">
                <p>Company Name</p>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                />
              </div>
              <div className="ci-inner cnc-email cnc-css">
                <p>GST / VAT Number</p>
                <input
                  type="text"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="cnc-ci">
              <div className="ci-inner cnc-phone cnc-css">
                <p>Business Phone</p>
                <input
                  type="text"
                  name="businessPhone"
                  value={form.businessPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="ci-inner cnc-join-date cnc-css">
                <p>Website</p>
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="ci-inner cnc-add cnc-css">
              <p>LinkedIn</p>
              <input
                type="text"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
              />
            </div>
            <div className="ci-inner cnc-add cnc-css">
              <p>Business Address</p>
              <input
                type="text"
                name="businessAddress"
                value={form.businessAddress}
                onChange={handleChange}
              />
            </div>
            <div className="ci-inner cnc-add cnc-css">
              <p>Additional Notes</p>
              <input
                type="text"
                name="additionalNotes"
                value={form.additionalNotes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Update button */}
      <section className="cnc-last-sec">
        <div className="sms-final_btns">
          <div className="cnc-btn sms-reset-btn">
            <a href="#">Cancel</a>
          </div>
          <div className="cnc-btn sms-save-btn">
            <button onClick={handleUpdate}>Update Client</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ClientFormEdit;
