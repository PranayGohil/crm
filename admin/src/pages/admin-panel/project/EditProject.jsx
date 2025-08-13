// File: EditProject.jsx
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
              existing_files: existingFiles, // Important for retaining unremoved images
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
    <div className="add_new_project_page">
      <section className="anp-add_new_project-header">
        <div className="anp-header-inner">
            <div className="anp-heading-main">
              <div
                className="anp-back-btn"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(-1);
                }}
                style={{ cursor: "pointer" }}
              >
                <img
                  src="/SVG/arrow-pc.svg"
                  alt="back"
                  className="mx-2"
                  style={{ scale: "1.3" }}
                />
              </div>
              <div className="head-menu">
                <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
                  Edit Project{" "}
                </h1>
              </div>
            </div>
          </div>
      </section>
      <form onSubmit={handleSubmit}>
        <section className="anp-add_new_project_form">
          <div className="anp-add_project_inner">
            {/* Project Name */}
            <div className="anp-prj_name sms-add_same">
              <span>Project Name</span>
              <input
                type="text"
                name="project_name"
                value={values.project_name}
                onChange={handleChange}
                placeholder="Enter Project Name"
                disabled={isSubmitting}
              />
              {touched.project_name && errors.project_name && (
                <div className="error">{errors.project_name}</div>
              )}
            </div>

            <div className="d-flex flex-col gap-4">
              {/* Client Dropdown */}
              <div className="anp-client-name btn_main" ref={dropdownRef}>
                <span className="anp-client-name-para">Client Name</span>
                <div
                  className="anp-dropdown_toggle dropdown_toggle"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="text_btn">
                    {values.client_name || "Select Client"}
                  </span>
                  <img src="/SVG/header-vector.svg" alt="arrow" />
                </div>
                {dropdownOpen && (
                  <ul className="anp-dropdown_menu">
                    {loading && <li>Loading...</li>}
                    {clientError && (
                      <li style={{ color: "red" }}>{clientError}</li>
                    )}
                    {!loading &&
                      clients.map((client) => (
                        <li
                          key={client._id}
                          onClick={() => {
                            setFieldValue("client_name", client.full_name);
                            setFieldValue("client_id", client._id);
                            setDropdownOpen(false);
                          }}
                        >
                          {client.full_name}
                        </li>
                      ))}
                  </ul>
                )}
                <a href="/client/create" className="anp-add_client_btn">
                  <img src="/SVG/plus-vec.svg" alt="plus" /> Add New Client
                </a>
              </div>

              {/* Dates */}
              <div className="anp-start_end-date sms-add_same">
                <span>Start Date - End Date</span>
                <div className="enp-date_input sms-add_same">
                  <input
                    type="date"
                    name="assign_date"
                    value={values.assign_date}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <input
                    type="date"
                    name="due_date"
                    value={values.due_date}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="error-group">
                  {touched.assign_date && errors.assign_date && (
                    <div className="error">{errors.assign_date}</div>
                  )}
                  {touched.due_date && errors.due_date && (
                    <div className="error">{errors.due_date}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="anp-client_priority sms-add_same">
              <span>Priority</span>
              <div className="anp-priority_btn">
                {["high", "mid", "low"].map((level) =>
                  level === "high" ? (
                    <div
                      key={level}
                      className={`pr_btn anp-${level}_btn ${
                        values.priority === "High" ? "active" : ""
                      }`}
                      onClick={() => setFieldValue("priority", "High")}
                    >
                      <img src={`/SVG/${level}-vec.svg`} alt={level} /> High
                    </div>
                  ) : level === "mid" ? (
                    <div
                      key={level}
                      className={`pr_btn anp-${level}_btn ${
                        values.priority === "Medium" ? "active" : ""
                      }`}
                      onClick={() => setFieldValue("priority", "Medium")}
                    >
                      <img src={`/SVG/${level}-vec.svg`} alt={level} /> Medium
                    </div>
                  ) : (
                    <div
                      key={level}
                      className={`pr_btn anp-${level}_btn ${
                        values.priority === "Low" ? "active" : ""
                      }`}
                      onClick={() => setFieldValue("priority", "Low")}
                    >
                      <img src={`/SVG/${level}-vec.svg`} alt={level} /> Low
                    </div>
                  )
                )}
              </div>
              {touched.priority && errors.priority && (
                <div className="error">{errors.priority}</div>
              )}
            </div>

            {/* Description */}
            <div className="epc-description-notes">
              <span>Project Description / Notes</span>
              <textarea
                rows={5}
                className="form-control"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            {/* Jewelry Items Table */}
            <div className="epc-add-item-table">
              <table className="jwell-table">
                <thead>
                  <tr>
                    <th>Jewelry Item</th>
                    <th>Quantity</th>
                    <th>Price per Item</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(idx, "name", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(idx, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(idx, "price", e.target.value)
                          }
                        />
                      </td>
                      <td>{getTotal(item.quantity, item.price)}</td>
                      <td>
                        <span onClick={() => deleteRow(idx)}>
                          <img src="/SVG/delete-vec.svg" alt="delete" />
                        </span>
                        <span onClick={() => resetRow(idx)}>
                          <img src="/SVG/refresh-vec.svg" alt="reset" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a
                href="#"
                className="epc-add-btn"
                onClick={(e) => {
                  e.preventDefault();
                  addItem();
                }}
              >
                <img src="/SVG/plus-vec.svg" alt="plus" /> Add Item
              </a>
            </div>

            {/* Price & Currency */}
            <div className="epc-price-overview">
              <div>
                <p>Select Currency</p>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="pc-dropdown_toggle bg-white"
                >
                  {["INR", "USD", "EUR", "AED"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p>Subtotal</p>
                <span>{getSubTotal()}</span>
              </div>
              <div>
                <p>Total Project Price</p>
                <input
                  type="number"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className="pc-dropdown_toggle bg-white"
                />
              </div>
            </div>

            {/* File Upload */}
            {existingFiles.length > 0 && (
              <div className="uploaded-files-preview mt-3">
                <ul className="file-list d-flex">
                  {existingFiles.map((file, index) => (
                    <li
                      key={index}
                      className="file-item d-flex flex-column mx-3"
                    >
                      <img
                        src={file}
                        alt="file"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "contain",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingFile(file)}
                      >
                        ❌ Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedFiles.length > 0 && (
              <div className="uploaded-files-preview mt-3">
                <h4>New Files to Upload</h4>
                <ul className="file-list d-flex">
                  {selectedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="file-item d-flex flex-column mx-3"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "contain",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(index)}
                      >
                        ❌ Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="epc-drag-drop-files">
              <img src="/SVG/drag-drop-vec.svg" alt="drag" />
              <span>Drag and drop files here or</span>
              <label className="browse-btn">
                Browse Files
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <div className="epc-num-of-file-uploaded">
              <span>{selectedFiles.length}</span>
              <p>new files selected</p>
            </div>

            {/* Submit Button */}
            <div className="anp-create_btn">
              <button
                type="submit"
                className="anp-create_task-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="loader"></div>
                ) : (
                  <>
                    <img src="/SVG/save-vec.svg" alt="save" /> Save Project
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default EditProject;
