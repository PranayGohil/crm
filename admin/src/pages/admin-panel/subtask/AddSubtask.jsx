import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { stageOptions, priorityOptions } from "../../../options";

const AddSubtask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const { projectId } = useParams();

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [activeTab, setActiveTab] = useState("single"); // "single" | "bulk"

  const [clientStagePricing, setClientStagePricing] = useState([]);

  const singleSchema = Yup.object({
    task_name: Yup.string().required("Subtask name is required"),
    stages: Yup.array()
      .of(Yup.string().oneOf(stageOptions))
      .min(1, "Select at least one stage")
      .required("Stage is required"),
    priority: Yup.string().required("Priority is required"),
    due_date: Yup.string().required("Due date is required"),
  });

  const bulkSchema = Yup.object({
    bulkPrefix: Yup.string().required("Prefix is required"),
    bulkStart: Yup.number().required("Start number is required").min(1),
    bulkEnd: Yup.number()
      .required("End number is required")
      .moreThan(Yup.ref("bulkStart"), "End must be greater than start"),
    bulkStage: Yup.array()
      .of(Yup.string().oneOf(stageOptions))
      .min(1, "Select at least one stage")
      .required("Stage is required"),
    bulkPriority: Yup.string().required("Priority is required"),
    bulkAssignDate: Yup.string().required("Start date is required"),
    bulkDueDate: Yup.string().required("Due date is required"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const empRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        );
        setEmployees(empRes.data);

        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
        );
        const clientId = projectRes.data.project?.client_id;

        if (clientId) {
          const clientRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/client/get/${clientId}`
          );
          setClientStagePricing(clientRes.data?.stage_pricing || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const getClientPrice = (stageName) => {
    const match = clientStagePricing.find((p) => p.stage_name === stageName);
    return match?.price ?? 0;
  };

  const handleAddSingle = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("task_name", values.task_name || "");
      formData.append("description", values.description || "");
      formData.append("url", values.url || "");
      formData.append("priority", values.priority || "");
      formData.append("assign_date", values.assign_date);
      formData.append("due_date", values.due_date);
      formData.append("assign_to", values.assign_to || "");
      formData.append("status", "To Do");
      mediaFiles.forEach((file) => formData.append("media_files", file));

      const stages = values.stages.map((name) => ({
        name,
        price: values.stagePrices[name] ?? getClientPrice(name),
        completed: false,
        completed_by: null,
        completed_at: null,
      }));
      formData.append("stages", JSON.stringify(stages));

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Subtask added successfully!");
      navigate(`/project/subtask-dashboard/${projectId}`);
    } catch (error) {
      console.error("Error adding subtask:", error);
      toast.error("Failed to add subtask.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async (values) => {
    setLoading(true);
    try {
      const newSubtasks = [];
      for (let i = values.bulkStart; i <= values.bulkEnd; i++) {
        newSubtasks.push({
          project_id: projectId,
          task_name: `${values.bulkPrefix} ${i}`,
          description: "",
          url: values.bulkUrl,
          stages: values.bulkStage.map((name) => ({
            name,
            price: values.bulkStagePrices[name] ?? getClientPrice(name),
            completed: false,
            completed_by: null,
            completed_at: null,
          })),
          priority: values.bulkPriority,
          assign_to: values.bulkAssignTo,
          assign_date: values.bulkAssignDate,
          due_date: values.bulkDueDate,
          status: "To do",
        });
      }
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/add-bulk`,
        newSubtasks,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Bulk subtasks created successfully!");
      navigate(`/project/subtask-dashboard/${projectId}`);
    } catch (error) {
      console.error("Error generating subtasks:", error);
      toast.error("Failed to generate subtasks.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/project/subtask-dashboard/${projectId}`)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg mr-3 sm:mr-4 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Add Subtask</h1>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-4">
        <button
          onClick={() => setActiveTab("single")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === "single" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          Single Subtask
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === "bulk" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          Bulk Generator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* ── Single Subtask Form ── */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${activeTab !== "single" ? "hidden lg:block" : ""}`}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Add New Subtask</h2>
          <Formik
            initialValues={{
              task_name: "",
              description: "",
              url: "",
              stages: [],
              stagePrices: {},
              priority: "",
              assign_to: "",
              assign_date: "",
              due_date: "",
            }}
            validationSchema={singleSchema}
            onSubmit={handleAddSingle}
          >
            {({ values, setFieldValue }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtask Name</label>
                  <Field type="text" name="task_name" placeholder="Subtask Name"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
                  <ErrorMessage name="task_name" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Field type="text" name="description" placeholder="Description"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <Field type="text" name="url" placeholder="URL"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
                </div>

                {/* Stage & Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stage & Price</label>
                  <div className="space-y-2">
                    {stageOptions.map((opt) => {
                      const isChecked = values.stages.includes(opt);
                      return (
                        <div key={opt} className="flex items-center gap-2 sm:gap-3">
                          <label className="flex items-center gap-2 min-w-0 flex-shrink-0" style={{ width: "clamp(120px, 40%, 160px)" }}>
                            <Field
                              type="checkbox"
                              name="stages"
                              value={opt}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFieldValue("stages", [...values.stages, opt]);
                                  setFieldValue("stagePrices", {
                                    ...values.stagePrices,
                                    [opt]: getClientPrice(opt),
                                  });
                                } else {
                                  setFieldValue("stages", values.stages.filter((s) => s !== opt));
                                  const updated = { ...values.stagePrices };
                                  delete updated[opt];
                                  setFieldValue("stagePrices", updated);
                                }
                              }}
                            />
                            <span className="text-sm text-gray-700 truncate">{opt}</span>
                          </label>

                          {isChecked && (
                            <div className="relative flex-1 min-w-0">
                              <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={values.stagePrices[opt] ?? ""}
                                onChange={(e) =>
                                  setFieldValue("stagePrices", {
                                    ...values.stagePrices,
                                    [opt]: parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder={`₹${getClientPrice(opt)}`}
                                className="w-full pl-6 sm:pl-7 pr-2 sm:pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <ErrorMessage name="stages" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <Field as="select" name="priority"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base">
                    <option value="">Select Priority</option>
                    {priorityOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="priority" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <Field as="select" name="assign_to"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base">
                    <option value="">Select Assign To</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>{emp.full_name}</option>
                    ))}
                  </Field>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date - End Date</label>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <Field type="date" name="assign_date"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <Field type="date" name="due_date"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                      <ErrorMessage name="due_date" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Included</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <input type="file" multiple style={{ display: "none" }} id="mediaFileInput"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setMediaFiles(files);
                        setMediaPreviews(files.map((file) => URL.createObjectURL(file)));
                      }} />
                    <label htmlFor="mediaFileInput" className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm">
                      Tap to browse files
                    </label>
                    <p className="text-gray-500 text-xs mt-1">JPG, PNG, PDF (Max 5MB)</p>
                  </div>
                </div>

                {mediaPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mediaPreviews.map((preview, idx) => (
                      <img key={idx} src={preview} alt="preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border border-gray-300" />
                    ))}
                  </div>
                )}

                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                  <button type="reset"
                    className="w-full xs:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base">
                    Reset Form
                  </button>
                  <button type="submit"
                    className="w-full xs:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                    Save Subtask
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* ── Bulk Subtask Generator ── */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${activeTab !== "bulk" ? "hidden lg:block" : ""}`}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Bulk Subtask Generator</h2>
          <Formik
            initialValues={{
              bulkPrefix: "",
              bulkStart: 1,
              bulkEnd: 5,
              bulkStage: [],
              bulkStagePrices: {},
              bulkPriority: "",
              bulkAssignTo: "",
              bulkAssignDate: "",
              bulkDueDate: "",
              bulkUrl: "",
            }}
            validationSchema={bulkSchema}
            onSubmit={handleBulkGenerate}
          >
            {({ values, setFieldValue }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtask Prefix</label>
                  <Field name="bulkPrefix" type="text" placeholder="e.g., Ring"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
                  <ErrorMessage name="bulkPrefix" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start No.</label>
                    <Field name="bulkStart" type="number"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
                    <ErrorMessage name="bulkStart" component="div" className="text-red-600 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End No.</label>
                    <Field name="bulkEnd" type="number"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
                    <ErrorMessage name="bulkEnd" component="div" className="text-red-600 text-xs mt-1" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <Field name="bulkUrl" type="text" placeholder="URL for all subtasks"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
                </div>

                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3">Common Settings</h3>

                  {/* Bulk Stages */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stage & Price</label>
                    <div className="space-y-2">
                      {stageOptions.map((opt) => {
                        const isChecked = values.bulkStage.includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2 sm:gap-3">
                            <label className="flex items-center gap-2 flex-shrink-0" style={{ width: "clamp(120px, 40%, 160px)" }}>
                              <Field
                                type="checkbox"
                                name="bulkStage"
                                value={opt}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFieldValue("bulkStage", [...values.bulkStage, opt]);
                                    setFieldValue("bulkStagePrices", {
                                      ...values.bulkStagePrices,
                                      [opt]: getClientPrice(opt),
                                    });
                                  } else {
                                    setFieldValue("bulkStage", values.bulkStage.filter((s) => s !== opt));
                                    const updated = { ...values.bulkStagePrices };
                                    delete updated[opt];
                                    setFieldValue("bulkStagePrices", updated);
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-700 truncate">{opt}</span>
                            </label>

                            {isChecked && (
                              <div className="relative flex-1 min-w-0">
                                <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={values.bulkStagePrices[opt] ?? ""}
                                  onChange={(e) =>
                                    setFieldValue("bulkStagePrices", {
                                      ...values.bulkStagePrices,
                                      [opt]: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  placeholder={`₹${getClientPrice(opt)}`}
                                  className="w-full pl-6 sm:pl-7 pr-2 sm:pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <ErrorMessage name="bulkStage" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <Field as="select" name="bulkPriority"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base">
                      <option value="">Select Priority</option>
                      {priorityOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="bulkPriority" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                    <Field as="select" name="bulkAssignTo"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base">
                      <option value="">Select Assign To</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>{emp.full_name}</option>
                      ))}
                    </Field>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date - End Date</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <Field type="date" name="bulkAssignDate"
                          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                        <ErrorMessage name="bulkAssignDate" component="div" className="text-red-600 text-xs mt-1" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <Field type="date" name="bulkDueDate"
                          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                        <ErrorMessage name="bulkDueDate" component="div" className="text-red-600 text-xs mt-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <button type="submit"
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Subtasks
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddSubtask;