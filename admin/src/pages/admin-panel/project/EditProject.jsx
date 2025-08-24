import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientError, setClientError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [items, setItems] = useState([{ name: "", quantity: 0, price: 0 }]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [projectDescription, setProjectDescription] = useState("");
  const [existingFiles, setExistingFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const project = projectRes.data.project;
        formik.setValues({
          project_name: project.project_name,
          client_id: project.client_id,
          client_name: project.client_name || "",
          assign_date: project.assign_date?.split("T")[0] || "",
          due_date: project.due_date?.split("T")[0] || "",
          priority: project.priority,
        });
        setItems(project.content[0]?.items || []);
        setTotalPrice(project.content[0]?.total_price || 0);
        setProjectDescription(project.content[0]?.description || "");
        setCurrency(project.content[0]?.currency || "INR");
        setExistingFiles(project.content[0]?.uploaded_files || []);
      } catch (err) {
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    const fetchClients = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get-all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setClients(res.data);
      } catch (err) {
        setClientError("Could not load clients");
      }
    };

    fetchData();
    fetchClients();
  }, [projectId]);

  const formik = useFormik({
    initialValues: {
      project_name: "",
      client_id: "",
      client_name: "",
      assign_date: "",
      due_date: "",
      priority: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      project_name: Yup.string().required("Project name is required"),
      client_id: Yup.string().required("Client is required"),
      assign_date: Yup.date().required("Start date is required"),
      due_date: Yup.date()
        .required("End date is required")
        .min(Yup.ref("assign_date"), "End date cannot be before start date"),
      priority: Yup.string().required("Priority is required"),
    }),
    onSubmit: async (values) => {
      if (!items.length) return toast.error("Add at least one item");
      setLoading(true);
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append(
          "data",
          JSON.stringify({
            ...values,
            content: {
              ...values.content,
              items,
              total_price: totalPrice,
              description: projectDescription,
              currency,
              existing_files: existingFiles,
            },
          })
        );

        selectedFiles.forEach((file) => formData.append("files", file));

        const res = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/project/update/${projectId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          toast.success("Project updated successfully");
          navigate("/project/dashboard");
        } else {
          toast.error("Failed to update project");
        }
      } catch (error) {
        toast.error("Something went wrong!");
      } finally {
        setLoading(false);
        setIsSubmitting(false);
      }
    },
  });

  const { handleChange, handleSubmit, setFieldValue, values, errors, touched } =
    formik;

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === "name" ? value : Number(value);
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { name: "", quantity: 0, price: 0 }]);
  const deleteRow = (index) => setItems(items.filter((_, i) => i !== index));
  const resetRow = (index) =>
    setItems(
      items.map((item, i) =>
        i === index ? { name: "", quantity: 0, price: 0 } : item
      )
    );
  const getTotal = (q, p) => q * p;
  const getSubTotal = () =>
    items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...filesArray]);
  };

  const handleRemoveExistingFile = (url) => {
    setExistingFiles(existingFiles.filter((file) => file !== url));
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-lg mr-4 hover:bg-gray-200 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Project</h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              name="project_name"
              value={values.project_name}
              onChange={handleChange}
              placeholder="Enter Project Name"
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {touched.project_name && errors.project_name && (
              <div className="text-red-600 text-sm mt-1">
                {errors.project_name}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <div
                className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span
                  className={
                    values.client_name ? "text-gray-800" : "text-gray-500"
                  }
                >
                  {values.client_name || "Select Client"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loading && (
                    <div className="px-4 py-2 text-gray-500">Loading...</div>
                  )}
                  {clientError && (
                    <div className="px-4 py-2 text-red-600">{clientError}</div>
                  )}
                  {!loading &&
                    clients.map((client) => (
                      <div
                        key={client._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setFieldValue("client_name", client.full_name);
                          setFieldValue("client_id", client._id);
                          setDropdownOpen(false);
                        }}
                      >
                        {client.full_name}
                      </div>
                    ))}
                </div>
              )}
              <Link
                to="/client/create"
                className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add New Client
              </Link>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date - End Date
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="assign_date"
                  value={values.assign_date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  name="due_date"
                  value={values.due_date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mt-1">
                {touched.assign_date && errors.assign_date && (
                  <div className="text-red-600 text-sm">
                    {errors.assign_date}
                  </div>
                )}
                {touched.due_date && errors.due_date && (
                  <div className="text-red-600 text-sm">{errors.due_date}</div>
                )}
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex space-x-3">
              {[
                { level: "high", label: "High", value: "High" },
                { level: "mid", label: "Medium", value: "Medium" },
                { level: "low", label: "Low", value: "Low" },
              ].map(({ level, label, value }) => (
                <button
                  key={level}
                  type="button"
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    values.priority === value
                      ? level === "high"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : level === "mid"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-green-100 text-green-800 border-green-300"
                      : "bg-gray-100 text-gray-800 border-gray-300"
                  }`}
                  onClick={() => setFieldValue("priority", value)}
                >
                  <span className="mr-2">{label}</span>
                </button>
              ))}
            </div>
            {touched.priority && errors.priority && (
              <div className="text-red-600 text-sm mt-1">{errors.priority}</div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description / Notes
            </label>
            <textarea
              rows={5}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Jewelry Items Table */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jewelry Items
            </label>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jewelry Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price per Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(idx, "name", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(idx, "quantity", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(idx, "price", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {getTotal(item.quantity, item.price)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => deleteRow(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => resetRow(idx)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Item
            </button>
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {["INR", "USD", "EUR", "AED"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtotal
              </label>
              <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                {getSubTotal()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Project Price
              </label>
              <input
                type="number"
                value={totalPrice}
                onChange={(e) => setTotalPrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* File Upload */}
          {(existingFiles.length > 0 || selectedFiles.length > 0) && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Uploaded Files
              </h3>

              {existingFiles.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Existing Files
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {existingFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={file}
                          alt="file"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingFile(file)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 group-hover:opacity-100 transition-opacity"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    New Files to Upload
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedFile(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 group-hover:opacity-100 transition-opacity"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600 mb-2">Drag and drop files here or</p>
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
              <span>Browse Files</span>
              <input type="file" multiple hidden onChange={handleFileChange} />
            </label>
            <p className="text-gray-500 text-sm mt-2">
              {selectedFiles.length} new files selected
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Project
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
