import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ClientForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    joining_date: "",
    address: "",
    username: "",
    client_type: "",
    password: "",
    confirm_password: "",
    company_name: "",
    gst_number: "",
    business_phone: "",
    website: "",
    linkedin: "",
    business_address: "",
    additional_notes: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // OPTIONAL: Validate passwords match
      if (formData.password !== formData.confirm_password) {
        alert("Passwords do not match");
        return;
      }

      // Make POST request to backend
      await axios
        .post(`${process.env.REACT_APP_API_URL}/api/client/add`, formData)
        .then((res) => {
          console.log(res.data);
          navigate("/client-dashboard");
        });
    } catch (err) {
      console.error(err);
      alert("Error adding client");
    }
  };

  return (
    <section className="cnc-sec2">
      <form onSubmit={handleSubmit}>
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
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div className="ci-inner cnc-email cnc-css">
                <p>Email Address</p>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., john@example.com"
                />
              </div>
            </div>
            <div className="cnc-ci">
              <div className="ci-inner cnc-phone cnc-css">
                <p>Phone Number</p>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., +91 9876543210"
                />
              </div>
              <div className="ci-inner cnc-join-date cnc-css">
                <p>Joining Date</p>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="cnc-add cnc-css">
              <p>Address</p>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, City, State, ZIP Code"
              />
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
                <p>Username</p>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g., John.Doe"
                />
              </div>
              <div className="ci-inner cnc-fullname cnc-css">
                <p>Client Type / Category</p>
                <input
                  type="text"
                  name="client_type"
                  value={formData.client_type}
                  onChange={handleChange}
                  placeholder="Client Type / Category"
                />
              </div>
            </div>
            <div className="cnc-ci">
              <div className="ci-inner cnc-phone cnc-css">
                <p>Password</p>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                />
              </div>
              <div className="ci-inner cnc-join-date cnc-css">
                <p>Confirm Password</p>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="********"
                />
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
              <div className="ci-inner cnc-fullname cnc-css">
                <p>Company Name</p>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Amore Corporation"
                />
              </div>
              <div className="ci-inner cnc-email cnc-css">
                <p>GST / VAT Number</p>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  placeholder="GST1234567ABC"
                />
              </div>
            </div>
            <div className="cnc-ci">
              <div className="ci-inner cnc-phone cnc-css">
                <p>Business Phone</p>
                <input
                  type="text"
                  name="business_phone"
                  value={formData.business_phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="ci-inner cnc-join-date cnc-css">
                <p>Website</p>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.amorecorp.com"
                />
              </div>
            </div>
            <div className="cnc-add cnc-css">
              <p>LinkedIn</p>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/amorecorp"
              />
            </div>
            <div className="cnc-add cnc-css">
              <p>Business Address</p>
              <input
                type="text"
                name="business_address"
                value={formData.business_address}
                onChange={handleChange}
                placeholder="789 Market Street, Suite 101, NY, USA"
              />
            </div>
            <div className="cnc-add cnc-css">
              <p>Additional Notes</p>
              <input
                type="text"
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleChange}
                placeholder="Client prefers email communication..."
              />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Add Client
        </button>
      </form>
    </section>
  );
};

export default ClientForm;
