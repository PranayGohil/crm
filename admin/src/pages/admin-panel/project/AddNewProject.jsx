import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const inputCls = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const AddNewProject = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [items, setItems] = useState([{ name: "", quantity: 0, price: 0 }]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`);
        setClients(res.data);
      } catch { setClientError("Could not load clients"); }
      finally { setLoading(false); }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const formik = useFormik({
    initialValues: { project_name: "", client_id: "", client_name: "", assign_date: "", due_date: "", priority: "" },
    validationSchema: Yup.object({
      project_name: Yup.string().required("Project name is required"),
      client_id: Yup.string().required("Client is required"),
      assign_date: Yup.date().required("Start date is required"),
      due_date: Yup.date().required("End date is required").min(Yup.ref("assign_date"), "End date cannot be before start date"),
      priority: Yup.string().required("Priority is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (!items.length) return toast.error("Add at least one item");
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("data", JSON.stringify({
          ...values, assign_to: [], tasks: [], status: "To do",
          content: { items, total_price: totalPrice, description: projectDescription, currency },
        }));
        selectedFiles.forEach((file) => formData.append("files", file));
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/project/add`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data.success) { toast.success("Project and content added!"); resetForm(); navigate("/project/dashboard"); }
        else toast.error("Failed to add project");
      } catch (err) { console.error(err); toast.error("Something went wrong!"); }
      finally { setLoading(false); }
    },
  });

  const { handleChange, handleSubmit, setFieldValue, values, errors, touched, isSubmitting } = formik;

  const updateItem = (i, field, val) => {
    const u = [...items]; u[i][field] = field === "name" ? val : Number(val); setItems(u);
  };
  const addItem = () => setItems([...items, { name: "", quantity: 0, price: 0 }]);
  const deleteRow = (i) => setItems(items.filter((_, j) => j !== i));
  const resetRow = (i) => setItems(items.map((it, j) => j === i ? { name: "", quantity: 0, price: 0 } : it));
  const getSubTotal = () => items.reduce((s, i) => s + i.quantity * i.price, 0);

  const handleFileChange = (e) => setSelectedFiles((p) => [...p, ...Array.from(e.target.files)]);
  const removeFile = (i) => setSelectedFiles((p) => p.filter((_, j) => j !== i));

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/project/dashboard")}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Add New Project</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-5">

        {/* Project Name */}
        <div>
          <label className={labelCls}>Project Name</label>
          <input type="text" name="project_name" value={values.project_name} onChange={handleChange}
            placeholder="Enter Project Name" disabled={isSubmitting} className={inputCls} />
          {touched.project_name && errors.project_name && <p className="text-red-600 text-xs mt-1">{errors.project_name}</p>}
        </div>

        {/* Client + Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className={labelCls}>Client Name</label>
            <div className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer bg-white"
              onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span className={values.client_name ? "text-gray-800" : "text-gray-400"}>
                {values.client_name || "Select Client"}
              </span>
              <svg className={`w-4 h-4 transition-transform text-gray-400 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {dropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {clientError && <div className="px-4 py-2 text-red-600 text-sm">{clientError}</div>}
                {clients.map((c) => (
                  <div key={c._id} className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setFieldValue("client_name", c.full_name); setFieldValue("client_id", c._id); setDropdownOpen(false); }}>
                    {c.full_name}
                  </div>
                ))}
              </div>
            )}
            {touched.client_id && errors.client_id && <p className="text-red-600 text-xs mt-1">{errors.client_id}</p>}
            <Link to="/client/create" className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-600 hover:text-blue-800">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Add New Client
            </Link>
          </div>

          {/* Dates */}
          <div>
            <label className={labelCls}>Start Date – End Date</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" name="assign_date" value={values.assign_date} onChange={handleChange} disabled={isSubmitting} className={inputCls} />
              <input type="date" name="due_date" value={values.due_date} onChange={handleChange} disabled={isSubmitting} className={inputCls} />
            </div>
            {touched.assign_date && errors.assign_date && <p className="text-red-600 text-xs mt-1">{errors.assign_date}</p>}
            {touched.due_date && errors.due_date && <p className="text-red-600 text-xs mt-1">{errors.due_date}</p>}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className={labelCls}>Priority</label>
          <div className="flex flex-wrap gap-2">
            {[
              { level: "high", label: "High", value: "High", active: "bg-red-100 text-red-800 border-red-300" },
              { level: "mid", label: "Medium", value: "Medium", active: "bg-yellow-100 text-yellow-800 border-yellow-300" },
              { level: "low", label: "Low", value: "Low", active: "bg-green-100 text-green-800 border-green-300" },
            ].map(({ label, value, active }) => (
              <button key={value} type="button"
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${values.priority === value ? active : "bg-gray-100 text-gray-700 border-gray-300"}`}
                onClick={() => setFieldValue("priority", value)}>
                {label}
              </button>
            ))}
          </div>
          {touched.priority && errors.priority && <p className="text-red-600 text-xs mt-1">{errors.priority}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Project Description / Notes</label>
          <textarea rows={4} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} className={inputCls} />
        </div>

        {/* Jewelry Items */}
        <div>
          <label className={labelCls}>Jewelry Items</label>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Item", "Qty", "Price", "Total", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2">
                      <input type="text" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)}
                        className="w-full min-w-[100px] px-2 py-1 text-sm border border-gray-300 rounded" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={item.price} onChange={(e) => updateItem(idx, "price", e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded" />
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{item.quantity * item.price}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => deleteRow(idx)} className="text-red-500 hover:text-red-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <button type="button" onClick={() => resetRow(idx)} className="text-blue-500 hover:text-blue-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addItem} className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Item
          </button>
        </div>

        {/* Currency / Subtotal / Total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className={labelCls}>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
              {["INR", "USD", "EUR", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Subtotal</label>
            <div className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700">{getSubTotal()}</div>
          </div>
          <div>
            <label className={labelCls}>Total Project Price</label>
            <input type="number" value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value))} className={inputCls} />
          </div>
        </div>

        {/* File previews */}
        {selectedFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Selected Files ({selectedFiles.length})</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3 mb-2">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={URL.createObjectURL(file)} alt={`p-${idx}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFile(idx)}
                    className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="truncate">{file.name}</p>
                    <p className="text-gray-300">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} · {(selectedFiles.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
            </p>
          </div>
        )}

        {/* Upload area */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400", "bg-blue-50"); }}
          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50"); setSelectedFiles((p) => [...p, ...Array.from(e.dataTransfer.files)]); }}>
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-500 mb-3">Drag and drop files here or</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Browse Files
            <input type="file" multiple hidden accept="image/*" onChange={handleFileChange} />
          </label>
          <p className="text-xs text-gray-400 mt-2">JPG, PNG, GIF, WebP</p>
          {selectedFiles.length > 0 && (
            <p className="text-blue-600 text-xs mt-1 font-medium">+ {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} ready</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {isSubmitting ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Create Project</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewProject;