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
    priority: "",
    assign_to: "",
    assign_date: "",
    due_date: "",
  });

  // Fetch employees & subtask details
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, subtaskRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`),
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`
          ),
        ]);

        setEmployees(empRes.data);

        const subtask = subtaskRes.data;

        setInitialValues({
          task_name: subtask.task_name || "",
          description: subtask.description || "",
          url: subtask.url || "",
          stages:
            subtask.stages?.map((s) =>
              typeof s === "string"
                ? {
                    name: s,
                    is_completed: false,
                    completed_by: null,
                    completed_at: null,
                  }
                : s
            ) || [],
          priority: subtask.priority || "",
          assign_to: subtask.assign_to?._id || subtask.assign_to || "",
          assign_date: subtask.assign_date?.slice(0, 10) || "",
          due_date: subtask.due_date?.slice(0, 10) || "",
        });

        // Set existing media previews
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

  // Handle form submit
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

      formData.append("stages", JSON.stringify(values.stages));

      mediaFiles.forEach((file) => formData.append("media_files", file));

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/update/${subtaskId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Subtask updated successfully!");
      navigate(-1); // go back or redirect
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update subtask.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-semibold text-gray-800">Edit Subtask</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={singleSchema}
          onSubmit={handleUpdate}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subtask Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtask Name
                  </label>
                  <Field
                    type="text"
                    name="task_name"
                    placeholder="Subtask Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="task_name"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <Field
                    type="text"
                    name="url"
                    placeholder="URL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="url"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="Description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {stageOptions.map((opt, idx) => (
                      <label key={idx} className="flex items-center">
                        <Field
                          type="checkbox"
                          name="stages"
                          value={JSON.stringify({
                            name: opt,
                            is_completed: false,
                          })}
                          checked={values.stages.some((s) => s.name === opt)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFieldValue("stages", [
                                ...values.stages,
                                { name: opt, is_completed: false },
                              ]);
                            } else {
                              setFieldValue(
                                "stages",
                                values.stages.filter((s) => s.name !== opt)
                              );
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage
                    name="stages"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* Priority and Assign To */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <Field
                      as="select"
                      name="priority"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Priority</option>
                      {priorityOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="priority"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To
                    </label>
                    <Field
                      as="select"
                      name="assign_to"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Assign To</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.full_name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="assign_to"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date - End Date
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Field
                      type="date"
                      name="assign_date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="assign_date"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Field
                      type="date"
                      name="due_date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="due_date"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Included
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <svg
                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
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
                  <input
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    id="mediaFileInput"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setMediaFiles(files);
                      setMediaPreviews(
                        files.map((file) => URL.createObjectURL(file))
                      );
                    }}
                  />
                  <label
                    htmlFor="mediaFileInput"
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Drag and drop files here or click to browse
                  </label>
                  <p className="text-gray-500 text-sm mt-1">
                    JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>
              </div>

              {/* Media Previews */}
              {mediaPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mediaPreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPreviews(
                            mediaPreviews.filter((_, i) => i !== idx)
                          );
                          setMediaFiles(mediaFiles.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-3 h-3"
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
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="reset"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
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
