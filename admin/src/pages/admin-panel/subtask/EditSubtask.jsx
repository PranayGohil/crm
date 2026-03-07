import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { stageOptions, priorityOptions } from "../../../options";

const EditSubtask = () => {
  const { subtaskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [clientStagePricing, setClientStagePricing] = useState([]);

  const singleSchema = Yup.object({
    task_name: Yup.string().required("Subtask name is required"),
    stages: Yup.array().min(1, "Select at least one stage"),
    priority: Yup.string().required("Priority is required"),
    assign_date: Yup.string().required("Start date is required"),
    due_date: Yup.string().required("Due date is required"),
  });

  const [initialValues, setInitialValues] = useState({
    task_name: "",
    description: "",
    url: "",
    stages: [],
    stagePrices: {},
    priority: "",
    assign_to: "",
    assign_date: "",
    due_date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, subtaskRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`),
        ]);

        setEmployees(empRes.data);
        const subtask = subtaskRes.data;

        if (subtask.project_id) {
          const projectRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/project/get/${subtask.project_id}`
          );
          const clientId = projectRes.data.project?.client_id;
          if (clientId) {
            const clientRes = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/client/get/${clientId}`
            );
            setClientStagePricing(clientRes.data?.stage_pricing || []);
          }
        }

        const stagePrices = {};
        subtask.stages?.forEach((s) => {
          const stageName = typeof s === "string" ? s : s.name;
          stagePrices[stageName] = s.price ?? 0;
        });

        setInitialValues({
          task_name: subtask.task_name || "",
          description: subtask.description || "",
          url: subtask.url || "",
          stages: subtask.stages?.map((s) => (typeof s === "string" ? s : s.name)) || [],
          stagePrices,
          priority: subtask.priority || "",
          assign_to: subtask.assign_to?._id || subtask.assign_to || "",
          assign_date: subtask.assign_date?.slice(0, 10) || "",
          due_date: subtask.due_date?.slice(0, 10) || "",
        });

        if (subtask.media_files && Array.isArray(subtask.media_files)) {
          const fullUrls = subtask.media_files.map((f) =>
            f.startsWith("http") ? f : `${process.env.REACT_APP_API_URL}/${f}`
          );
          setMediaPreviews(fullUrls);
        }
      } catch (error) {
        console.error("Error fetching subtask:", error);
        toast.error("Failed to load subtask details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subtaskId]);

  const getClientPrice = (stageName) => {
    const match = clientStagePricing.find((p) => p.stage_name === stageName);
    return match?.price ?? 0;
  };

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("task_name", values.task_name);
      formData.append("description", values.description);
      formData.append("url", values.url);
      formData.append("priority", values.priority);
      formData.append("assign_date", values.assign_date);
      formData.append("due_date", values.due_date);
      formData.append("assign_to", values.assign_to);

      const stagesWithPrices = values.stages.map((name) => ({
        name,
        price: values.stagePrices[name] ?? getClientPrice(name),
        is_completed: false,
        completed_by: null,
        completed_at: null,
      }));
      formData.append("stages", JSON.stringify(stagesWithPrices));
      mediaFiles.forEach((file) => formData.append("media_files", file));

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/update/${subtaskId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      toast.success("Subtask updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update subtask.");
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
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg mr-3 sm:mr-4 hover:bg-gray-200 transition-colors flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit Subtask</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <Formik enableReinitialize initialValues={initialValues}
          validationSchema={singleSchema} onSubmit={handleUpdate}>
          {({ values, setFieldValue }) => (
            <Form className="space-y-5 sm:space-y-6">

              {/* Row 1: Name + URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtask Name</label>
                  <Field type="text" name="task_name" placeholder="Subtask Name"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
                  <ErrorMessage name="task_name" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <Field type="text" name="url" placeholder="URL"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Field as="textarea" name="description" placeholder="Description" rows={3}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
              </div>

              {/* Stage & Priority row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Stages with Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stage & Price</label>
                  <div className="space-y-2">
                    {stageOptions.map((opt) => {
                      const isChecked = values.stages.includes(opt);
                      return (
                        <div key={opt} className="flex items-center gap-2 sm:gap-3">
                          <label className="flex items-center gap-2 flex-shrink-0" style={{ width: "clamp(120px, 40%, 160px)" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFieldValue("stages", [...values.stages, opt]);
                                  setFieldValue("stagePrices", {
                                    ...values.stagePrices,
                                    [opt]: values.stagePrices[opt] ?? getClientPrice(opt),
                                  });
                                } else {
                                  setFieldValue("stages", values.stages.filter((s) => s !== opt));
                                  const updated = { ...values.stagePrices };
                                  delete updated[opt];
                                  setFieldValue("stagePrices", updated);
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
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

                {/* Priority + Assign To */}
                <div className="space-y-4">
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
                </div>
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date - End Date</label>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <Field type="date" name="assign_date"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    <ErrorMessage name="assign_date" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <Field type="date" name="due_date"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    <ErrorMessage name="due_date" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* File Upload */}
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
                    <div key={idx} className="relative group">
                      <img src={preview} alt="preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border border-gray-300" />
                      <button type="button"
                        onClick={() => {
                          setMediaPreviews(mediaPreviews.filter((_, i) => i !== idx));
                          setMediaFiles(mediaFiles.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-red-600 text-white rounded-full p-0.5 sm:p-1">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-2">
                <button type="reset"
                  className="w-full xs:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base">
                  Reset Form
                </button>
                <button type="submit"
                  className="w-full xs:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                  Update Subtask
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditSubtask;