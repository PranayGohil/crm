import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const STAGE_OPTIONS = ["CAD Design", "SET Design", "Render", "QC", "Delivery"];

/* ── Reusable field components ────────────────────────────── */
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

const inputCls = "w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60";

const CreateNewClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      full_name: "", email: "", phone: "", joining_date: "", address: "",
      username: "", client_type: "", password: "", confirm_password: "",
      company_name: "", gst_number: "", business_phone: "", website: "",
      linkedin: "", business_address: "", additional_notes: "",
      stage_pricing: STAGE_OPTIONS.map((stage) => ({ stage_name: stage, price: 0 })),
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required("Full name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string().required("Phone is required"),
      joining_date: Yup.date().required("Joining date is required"),
      address: Yup.string().required("Address is required"),
      username: Yup.string().matches(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only").required("Username is required"),
      client_type: Yup.string().required("Client type is required"),
      password: Yup.string().min(8, "Min 8 chars").matches(/[A-Z]/, "Needs uppercase").matches(/[0-9]/, "Needs number").matches(/[!@#$%^&*(),.?":{}|<>]/, "Needs special char").required("Password is required"),
      confirm_password: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match").required("Please confirm password"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setLoading(true);
        const { confirm_password, ...payload } = values;
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/client/add`, payload, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data.success) {
          toast.success("Client added successfully!");
          resetForm();
          setTimeout(() => navigate("/client/dashboard"), 1500);
        } else {
          toast.error(res.data.message || "Failed to add client");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error adding client");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  const { handleChange, handleSubmit, values, errors, touched, isSubmitting, setFieldValue } = formik;

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Page header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Create New Client</h1>
            <p className="text-xs sm:text-sm text-gray-500">Add a new client to your dashboard</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Client Information ── */}
          <section>
            <h2 className="text-base sm:text-xl font-semibold text-gray-800 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Field label="Full Name" error={touched.full_name && errors.full_name}>
                <input type="text" name="full_name" value={values.full_name} onChange={handleChange} placeholder="e.g., John Doe" disabled={isSubmitting} className={inputCls} />
              </Field>
              <Field label="Email Address" error={touched.email && errors.email}>
                <input type="email" name="email" value={values.email} onChange={handleChange} placeholder="john@example.com" disabled={isSubmitting} className={inputCls} />
              </Field>
              <Field label="Phone Number" error={touched.phone && errors.phone}>
                <input type="text" name="phone" value={values.phone} onChange={handleChange} placeholder="+91 9876543210" disabled={isSubmitting} className={inputCls} />
              </Field>
              <Field label="Joining Date" error={touched.joining_date && errors.joining_date}>
                <input type="date" name="joining_date" value={values.joining_date} onChange={handleChange} disabled={isSubmitting} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address" error={touched.address && errors.address}>
                  <input type="text" name="address" value={values.address} onChange={handleChange} placeholder="Street, City, State, ZIP" disabled={isSubmitting} className={inputCls} />
                </Field>
              </div>
            </div>
          </section>

          {/* ── Account Credentials ── */}
          <section className="pt-6 border-t border-gray-200">
            <h2 className="text-base sm:text-xl font-semibold text-gray-800 mb-4">Account Credentials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Field label="Username" error={touched.username && errors.username}>
                <input type="text" name="username" value={values.username} onChange={handleChange} placeholder="e.g., John.Doe" disabled={isSubmitting} className={inputCls} />
              </Field>
              <Field label="Client Type" error={touched.client_type && errors.client_type}>
                <input type="text" name="client_type" value={values.client_type} onChange={handleChange} placeholder="e.g., Enterprise" disabled={isSubmitting} className={inputCls} />
              </Field>
              <Field label="Password" error={touched.password && errors.password}>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={values.password} onChange={handleChange} placeholder="********" disabled={isSubmitting} className={inputCls} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password" error={touched.confirm_password && errors.confirm_password}>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={values.confirm_password} onChange={handleChange} placeholder="********" disabled={isSubmitting} className={inputCls} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </Field>
            </div>
          </section>

          {/* ── Stage Pricing ── */}
          <section className="pt-6 border-t border-gray-200">
            <h2 className="text-base sm:text-xl font-semibold text-gray-800 mb-1">Stage Pricing</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">Default prices per stage — auto-filled when creating subtasks.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {values.stage_pricing.map((item, index) => (
                <div key={item.stage_name} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">{item.stage_name}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                    <input type="number" min="0" value={item.price}
                      onChange={(e) => setFieldValue(`stage_pricing[${index}].price`, parseFloat(e.target.value) || 0)}
                      disabled={isSubmitting}
                      className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Additional Details ── */}
          <section className="pt-6 border-t border-gray-200">
            <h2 className="text-base sm:text-xl font-semibold text-gray-800 mb-4">Additional Details <span className="text-gray-400 text-sm font-normal">(Optional)</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Field label="Company Name">
                <input type="text" name="company_name" value={values.company_name} onChange={handleChange} placeholder="Amore Corporation" disabled={isSubmitting} className={inputCls} />
              </Field>
              <Field label="GST / VAT Number">
                <input type="text" name="gst_number" value={values.gst_number} onChange={handleChange} placeholder="GST1234567ABC" disabled={isSubmitting} className={inputCls} />
              </Field>
              <Field label="Business Phone">
                <input type="text" name="business_phone" value={values.business_phone} onChange={handleChange} placeholder="+91 9876543210" disabled={isSubmitting} className={inputCls} />
              </Field>
              <Field label="Website">
                <input type="text" name="website" value={values.website} onChange={handleChange} placeholder="https://example.com" disabled={isSubmitting} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="LinkedIn">
                  <input type="text" name="linkedin" value={values.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/..." disabled={isSubmitting} className={inputCls} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Business Address">
                  <input type="text" name="business_address" value={values.business_address} onChange={handleChange} placeholder="789 Market Street, NY" disabled={isSubmitting} className={inputCls} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Additional Notes">
                  <input type="text" name="additional_notes" value={values.additional_notes} onChange={handleChange} placeholder="Client prefers email communication..." disabled={isSubmitting} className={inputCls} />
                </Field>
              </div>
            </div>
          </section>

          {/* ── Form Actions ── */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              {isSubmitting ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Adding...</>
              ) : "Add Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewClient;