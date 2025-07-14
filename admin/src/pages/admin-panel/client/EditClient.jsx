import { useNavigate, Link, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
      phone: "",
      joining_date: "",
      address: "",
      username: "",
      client_type: "",
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
      username: Yup.string().required("Username is required"),
      client_type: Yup.string().required("Client type is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      try {
        setSubmitting(true);
        const res = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/client/update-username/${id}`,
          values
        );
        toast.success("Client updated successfully!");
        navigate(`/client/details/${values.username}`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update client");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
    enableReinitialize: true, // so initialValues updates when we fetch data
  });

  // Fetch client data on load
  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get-username/${id}`
        );
        const client = res.data;
        formik.setValues({
          full_name: client.full_name || "",
          email: client.email || "",
          phone: client.phone || "",
          joining_date: client.joining_date
            ? client.joining_date.substring(0, 10)
            : "",
          address: client.address || "",
          username: client.username || "",
          client_type: client.client_type || "",
          company_name: client.company_name || "",
          gst_number: client.gst_number || "",
          business_phone: client.business_phone || "",
          website: client.website || "",
          linkedin: client.linkedin || "",
          business_address: client.business_address || "",
          additional_notes: client.additional_notes || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load client data");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]); // eslint-disable-line

  const { handleChange, handleSubmit, values, errors, touched, isSubmitting } =
    formik;

  if (loading) return <LoadingOverlay />;

  return (
    <>
      <LoadingOverlay show={loading || isSubmitting} />
      <section className="cnc-first cd-client_dashboard header header_back_arrow">
        <Link
          to={`/client/details/${values.username}`}
          className="back_arrow_link mx-3"
        >
          <img src="/SVG/arrow-pc.svg" alt="Back" className="back_arrow" />
        </Link>
        <div className="cnc-first-inner cd-head-menu head-menu">
          <h1>Edit Client</h1>
          <p>Update client details in your dashboard</p>
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
            </div>
          </div>

          {/* section 3 */}
          <div className="cnc-sec2-inner mt-5">
            <div className="cnc-first-inner cd-head-menu head-menu">
              <h1>Additional Details (Optional)</h1>
            </div>
            <div className="cnc-client-inf">
              <div className="cnc-ci">
                <div className="ci-inner cnc-css">
                  <p>Company Name</p>
                  <input
                    type="text"
                    name="company_name"
                    value={values.company_name}
                    onChange={handleChange}
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
              {isSubmitting ? <div className="loader"></div> : "Update Client"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
};

export default EditClient;
