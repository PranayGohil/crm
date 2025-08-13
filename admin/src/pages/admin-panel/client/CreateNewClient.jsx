import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

import { FaEye, FaEyeSlash } from "react-icons/fa";

const CreateNewClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
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
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required("Full name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string().required("Phone is required"),
      joining_date: Yup.date().required("Joining date is required"),
      address: Yup.string().required("Address is required"),
      username: Yup.string()
        .matches(/^[a-zA-Z0-9_-]+$/, {
          message:
            "Username can only contain letters, numbers, underscores (_) and dashes (-).",
        })
        .required("Username is required"),
      client_type: Yup.string().required("Client type is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        )
        .required("Password is required"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Please confirm password"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setLoading(true);
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/client/add`,
          values
        );
        if (res.data.success) {
          toast.success("Client added successfully!");
          resetForm();
          setTimeout(() => navigate("/client/dashboard"), 1500);
        } else {
          toast.error(res.data.message || "Failed to add client");
          console.error(res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { handleChange, handleSubmit, values, errors, touched, isSubmitting } =
    formik;

  if (loading) return <LoadingOverlay />;

  return (
    <>
      <section className="cnc-first cd-client_dashboard header header_back_arrow">
        <Link to="/client/dashboard" className="back_arrow_link mx-3">
          <img src="/SVG/arrow-pc.svg" alt="Back" className="back_arrow" style={{ scale: "1.3" }} />
        </Link>
        <div className="cnc-first-inner cd-head-menu head-menu">
          <h1>Create New Client</h1>
          <p>Add a new client to your dashboard</p>
        </div>
      </section>

      <section className="cnc-sec2">
        <form onSubmit={handleSubmit}>
          {/* section 1 */}
          <div className="cnc-sec2-inner">
            <div className="cnc-first-inner cd-head-menu head-menu">
              <h1>Client Information</h1>
            </div>
            <div className="cnc-client-inf">
              <div className="cnc-ci">
                <div className="ci-inner cnc-css">
                  <p>Full Name</p>
                  <input
                    type="text"
                    name="full_name"
                    value={values.full_name}
                    onChange={handleChange}
                    placeholder="e.g., John Doe"
                    disabled={isSubmitting}
                  />
                  {touched.full_name && errors.full_name && (
                    <div className="error">{errors.full_name}</div>
                  )}
                </div>
                <div className="ci-inner cnc-css">
                  <p>Email Address</p>
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="e.g., john@example.com"
                    disabled={isSubmitting}
                  />
                  {touched.email && errors.email && (
                    <div className="error">{errors.email}</div>
                  )}
                </div>
              </div>

              <div className="cnc-ci">
                <div className="ci-inner cnc-css">
                  <p>Phone Number</p>
                  <input
                    type="text"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    disabled={isSubmitting}
                  />
                  {touched.phone && errors.phone && (
                    <div className="error">{errors.phone}</div>
                  )}
                </div>
                <div className="ci-inner cnc-css">
                  <p>Joining Date</p>
                  <input
                    type="date"
                    name="joining_date"
                    value={values.joining_date}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {touched.joining_date && errors.joining_date && (
                    <div className="error">{errors.joining_date}</div>
                  )}
                </div>
              </div>

              <div className="cnc-add cnc-css">
                <p>Address</p>
                <input
                  type="text"
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  placeholder="Street, City, State, ZIP Code"
                  disabled={isSubmitting}
                />
                {touched.address && errors.address && (
                  <div className="error">{errors.address}</div>
                )}
              </div>
            </div>
          </div>

          {/* section 2 */}
          <div className="cnc-sec2-inner mt-5">
            <div className="cnc-first-inner cd-head-menu head-menu">
              <h1>Account Credentials</h1>
            </div>
            <div className="cnc-client-inf">
              <div className="cnc-ci">
                <div className="ci-inner cnc-css">
                  <p>Username</p>
                  <input
                    type="text"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    placeholder="e.g., John.Doe"
                    disabled={isSubmitting}
                  />
                  {touched.username && errors.username && (
                    <div className="error">{errors.username}</div>
                  )}
                </div>
                <div className="ci-inner cnc-css">
                  <p>Client Type / Category</p>
                  <input
                    type="text"
                    name="client_type"
                    value={values.client_type}
                    onChange={handleChange}
                    placeholder="Client Type / Category"
                    disabled={isSubmitting}
                  />
                  {touched.client_type && errors.client_type && (
                    <div className="error">{errors.client_type}</div>
                  )}
                </div>
              </div>

              <div className="cnc-ci">
                <div
                  className="ci-inner cnc-css"
                >
                  <p>Password</p>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      placeholder="********"
                      disabled={isSubmitting}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="eye-icon"
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                </div>
                {touched.password && errors.password && (
                  <div className="error">{errors.password}</div>
                )}
                <div className="ci-inner cnc-css">
                  <p>Confirm Password</p>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={values.confirm_password}
                      onChange={handleChange}
                      placeholder="********"
                      disabled={isSubmitting}
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="eye-icon"
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                </div>
                {touched.confirm_password && errors.confirm_password && (
                  <div className="error">{errors.confirm_password}</div>
                )}
              </div>
            </div>
          </div>

          {/* section 3 */}
          <div className="cnc-sec2-inner mt-5">
            <div className="cnc-first-inner cd-head-menu head-menu">
              <h1>Additional Details (Optional)</h1>
            </div>
            <div className="cnc-client-inf">
              {/* optional fields (same as before, disable={isSubmitting}) */}
              <div className="cnc-ci">
                <div className="ci-inner cnc-css">
                  <p>Company Name</p>
                  <input
                    type="text"
                    name="company_name"
                    value={values.company_name}
                    onChange={handleChange}
                    placeholder="Amore Corporation"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="ci-inner cnc-css">
                  <p>GST / VAT Number</p>
                  <input
                    type="text"
                    name="gst_number"
                    value={values.gst_number}
                    onChange={handleChange}
                    placeholder="GST1234567ABC"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="cnc-ci">
                <div className="ci-inner cnc-css">
                  <p>Business Phone</p>
                  <input
                    type="text"
                    name="business_phone"
                    value={values.business_phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="ci-inner cnc-css">
                  <p>Website</p>
                  <input
                    type="text"
                    name="website"
                    value={values.website}
                    onChange={handleChange}
                    placeholder="https://www.amorecorp.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="cnc-add cnc-css">
                <p>LinkedIn</p>
                <input
                  type="text"
                  name="linkedin"
                  value={values.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/amorecorp"
                  disabled={isSubmitting}
                />
              </div>
              <div className="cnc-add cnc-css">
                <p>Business Address</p>
                <input
                  type="text"
                  name="business_address"
                  value={values.business_address}
                  onChange={handleChange}
                  placeholder="789 Market Street, Suite 101, NY, USA"
                  disabled={isSubmitting}
                />
              </div>
              <div className="cnc-add cnc-css">
                <p>Additional Notes</p>
                <input
                  type="text"
                  name="additional_notes"
                  value={values.additional_notes}
                  onChange={handleChange}
                  placeholder="Client prefers email communication..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="theme_secondary_btn mt-3 me-3"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="theme_btn mt-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? <div className="loader"></div> : "Add Client"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
};

export default CreateNewClient;
