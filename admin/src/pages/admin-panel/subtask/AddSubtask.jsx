import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        );
        setEmployees(res.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

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
        newSubtasks
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
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/project/subtask-dashboard/${projectId}`)}
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
          <h1 className="text-2xl font-semibold text-gray-800">Add Subtask</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Subtask Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Subtask
          </h2>
          <Formik
            initialValues={{
              task_name: "",
              description: "",
              url: "",
              stages: [],
              priority: "",
              assign_to: "",
              assign_date: "",
              due_date: "",
            }}
            validationSchema={singleSchema}
            onSubmit={handleAddSingle}
          >
            {() => (
              <Form className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Field
                    type="text"
                    name="description"
                    placeholder="Description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {stageOptions.map((opt) => (
                      <label key={opt} className="flex items-center">
                        <Field
                          type="checkbox"
                          name="stages"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          value={opt}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date - End Date
                  </label>
                  <div className="grid grid-cols-2 gap-3">
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

                {mediaPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mediaPreviews.map((preview, idx) => (
                      <img
                        key={idx}
                        src={preview}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded border border-gray-300"
                      />
                    ))}
                  </div>
                )}

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
                    Save Subtask
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* Bulk Subtask Generator */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Bulk Subtask Generator
          </h2>
          <Formik
            initialValues={{
              bulkPrefix: "",
              bulkStart: 1,
              bulkEnd: 5,
              bulkStage: [],
              bulkPriority: "",
              bulkAssignTo: "",
              bulkAssignDate: "",
              bulkDueDate: "",
              bulkUrl: "",
            }}
            validationSchema={bulkSchema}
            onSubmit={handleBulkGenerate}
          >
            {() => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtask Prefix
                  </label>
                  <Field
                    name="bulkPrefix"
                    type="text"
                    placeholder="e.g., Ring"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="bulkPrefix"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Number
                    </label>
                    <Field
                      name="bulkStart"
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="bulkStart"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Number
                    </label>
                    <Field
                      name="bulkEnd"
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="bulkEnd"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <Field
                    name="bulkUrl"
                    type="text"
                    placeholder="URL for all subtasks"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="bulkUrl"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Common Settings for Generated Subtasks
                  </h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stage
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {stageOptions.map((opt) => (
                        <label key={opt} className="flex items-center">
                          <Field
                            type="checkbox"
                            name="bulkStage"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            value={opt}
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                    <ErrorMessage
                      name="bulkStage"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <Field
                      as="select"
                      name="bulkPriority"
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
                      name="bulkPriority"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To
                    </label>
                    <Field
                      as="select"
                      name="bulkAssignTo"
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
                      name="bulkAssignTo"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date - End Date
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Field
                          type="date"
                          name="bulkAssignDate"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <ErrorMessage
                          name="bulkAssignDate"
                          component="div"
                          className="text-red-600 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Field
                          type="date"
                          name="bulkDueDate"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <ErrorMessage
                          name="bulkDueDate"
                          component="div"
                          className="text-red-600 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
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
