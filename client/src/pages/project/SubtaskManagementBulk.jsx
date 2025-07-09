import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SubtaskManagementBulk = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const { projectId } = useParams();

  const assignToOptions = ["em1", "em2", "em3"];
  const priorityOptions = ["Low", "Medium", "High"];
  const stageOptions = ["Design", "Render"];

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  const singleSchema = Yup.object({
    task_name: Yup.string().required("Subtask name is required"),
    description: Yup.string().required("Description is required"),
    stage: Yup.string().required("Stage is required"),
    priority: Yup.string().required("Priority is required"),
    asign_to: Yup.string().required("Assign To is required"),
  });

  const bulkSchema = Yup.object({
    bulkPrefix: Yup.string().required("Prefix is required"),
    bulkStart: Yup.number().required("Start number is required").min(1),
    bulkEnd: Yup.number()
      .required("End number is required")
      .moreThan(Yup.ref("bulkStart"), "End must be greater than start"),
    bulkStage: Yup.string().required("Stage is required"),
    bulkPriority: Yup.string().required("Priority is required"),
    bulkAssignTo: Yup.string().required("Assign To is required"),
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        );
        setEmployees(res.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleAddSingle = async (values) => {
    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("task_name", values.task_name);
      formData.append("description", values.description);
      formData.append("stage", values.stage);
      formData.append("priority", values.priority);
      formData.append(
        "asign_to",
        JSON.stringify([{ role: "Employee", id: values.asign_to }])
      );
      formData.append("status", "To do");
      mediaFiles.forEach((file) => formData.append("media_files", file));

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/add`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Subtask added successfully!");
      navigate(`/project/subtask-dashboard/${projectId}`);
    } catch (error) {
      console.error("Error adding subtask:", error);
      toast.error("Failed to add subtask.");
    }
  };

  const handleBulkGenerate = async (values) => {
    try {
      const newSubtasks = [];
      for (let i = values.bulkStart; i <= values.bulkEnd; i++) {
        newSubtasks.push({
          project_id: projectId,
          task_name: `${values.bulkPrefix} ${i}`,
          description: "",
          stage: values.bulkStage,
          priority: values.bulkPriority,
          asign_to: [{ role: "Employee", id: values.bulkAssignTo }],
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
    }
  };

  return (
    <div className="subtask-management-bulk-page">
      <ToastContainer position="top-center" />
      <section className="sms-subtask-mng-header mg-auto">
        <div className="sms-header-inner">
          <div className="sms-heading-main">
            <Link to={`/project/subtask-dashboard/${projectId}`} className="sms-back-link">
              <img src="/SVG/arrow-pc.svg" alt="" />
            </Link>
            <div className="sms-heading-txt">
              <h1>Subtask Management</h1>
              <div className="sms-client-inf">
                <span>Client: Luxe Jewelry Co.</span>
                <span>• May 15, 2023 - July 30, 2023</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sms-add_and_generator mg-auto">
        <div className="sms-add_and_generatoe_inner">
          {/* Single Subtask */}
          <div className="sms-add_new-task sms-add_gen-task">
            <div className="sms-add_task-inner">
              <div className="sms-add_task-heading">
                <h2>Add New Subtask</h2>
              </div>
              <Formik
                initialValues={{
                  task_name: "",
                  description: "",
                  stage: "",
                  priority: "",
                  asign_to: "",
                }}
                validationSchema={singleSchema}
                onSubmit={handleAddSingle}
              >
                {() => (
                  <Form className="add-sub_task_main add-add_gen_main">
                    <div className="sms-add_task-form">
                      <div className="sms-add_name sms-add_same">
                        <span>Subtask Name</span>
                        <Field
                          type="text"
                          name="task_name"
                          placeholder="Subtask Name"
                        />
                        <ErrorMessage
                          name="task_name"
                          component="div"
                          className="error"
                        />
                      </div>
                    </div>

                    <div className="sms-add_task-form">
                      <div className="sms-add_des sms-add_same">
                        <span>Description</span>
                        <Field
                          type="text"
                          name="description"
                          placeholder="Description"
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="error"
                        />
                      </div>
                    </div>

                    <div className="sms-add_task-form">
                      <div className="sms-add_same">
                        <span>Stage</span>
                        <Field
                          as="select"
                          name="stage"
                          className="dropdown_toggle w-100 "
                        >
                          <option value="">Select Stage</option>
                          {stageOptions.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="stage"
                          component="div"
                          className="error"
                        />
                      </div>
                    </div>

                    <div className="sms-add_task-form">
                      <div className="sms-add_same">
                        <span>Priority</span>
                        <Field
                          as="select"
                          name="priority"
                          className="dropdown_toggle w-100 "
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
                          className="error"
                        />
                      </div>
                    </div>

                    <div className="sms-add_task-form">
                      <div className="sms-add_same">
                        <span>Assign To</span>
                        <Field
                          as="select"
                          name="asign_to"
                          className="dropdown_toggle w-100 "
                        >
                          <option value="">Select Assign To</option>
                          {employees.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                              {emp.full_name}
                            </option>
                          ))}
                        </Field>

                        <ErrorMessage
                          name="asign_to"
                          component="div"
                          className="error"
                        />
                      </div>
                    </div>

                    <div className="sms-attach_files sms-add_same">
                      <span>Content Included</span>
                      <div className="epc-drag-drop-files">
                        <img src="/SVG/drag-drop-vec.svg" alt="drag" />
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
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("mediaFileInput").click();
                          }}
                        >
                          Drag and drop files here or click to browse
                        </a>
                        <span>JPG, PNG, PDF (Max 5MB)</span>
                      </div>
                    </div>

                    {mediaPreviews.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {mediaPreviews.map((preview, idx) => (
                          <img
                            key={idx}
                            src={preview}
                            alt="preview"
                            style={{ maxWidth: "80px" }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="sms-final_btns">
                      <div className="sms-reset-btn">
                        <button type="reset" className="theme_secondary_btn">
                          Reset Form
                        </button>
                      </div>
                      <div className="sms-save-btn">
                        <button type="submit" className="theme_btn">
                          Save Subtask
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          {/* Bulk Subtask Generator */}
          <div className="sms-generate_task sms-add_gen-task">
            <div className="sms-add_task-inner">
              <div className="sms-add_task-heading">
                <h2>Bulk Subtask Generator</h2>
              </div>
              <Formik
                initialValues={{
                  bulkPrefix: "",
                  bulkStart: 1,
                  bulkEnd: 5,
                  bulkStage: "",
                  bulkPriority: "",
                  bulkAssignTo: "",
                }}
                validationSchema={bulkSchema}
                onSubmit={handleBulkGenerate}
              >
                {() => (
                  <Form className="sms-add_task-form add-add_gen_main">
                    <div className="sms-add_subfix sms-add_same">
                      <span>Subtask Prefix</span>
                      <Field
                        name="bulkPrefix"
                        type="text"
                        placeholder="e.g., Ring"
                      />
                      <ErrorMessage
                        name="bulkPrefix"
                        component="div"
                        className="error"
                      />
                    </div>

                    <div className="sms-add_number sms-add_same">
                      <div className="add_num-1 sms-add_same">
                        <span>Start Number</span>
                        <Field name="bulkStart" type="number" />
                        <ErrorMessage
                          name="bulkStart"
                          component="div"
                          className="error"
                        />
                      </div>
                      <div className="add_num-1 sms-add_same">
                        <span>End Number</span>
                        <Field name="bulkEnd" type="number" />
                        <ErrorMessage
                          name="bulkEnd"
                          component="div"
                          className="error"
                        />
                      </div>
                    </div>

                    <div className="sms-comman-setting">
                      <h3>Common Settings for Generated Subtasks</h3>

                      <div className="sms-add_same">
                        <span>Stage</span>
                        <Field
                          as="select"
                          name="bulkStage"
                          className="dropdown_toggle w-100 "
                        >
                          <option value="">Select Stage</option>
                          {stageOptions.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="bulkStage"
                          component="div"
                          className="error"
                        />
                      </div>

                      <div className="sms-add_same">
                        <span>Priority</span>
                        <Field
                          as="select"
                          name="bulkPriority"
                          className="dropdown_toggle w-100 "
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
                          className="error"
                        />
                      </div>

                      <div className="sms-add_same">
                        <span>Assign To</span>
                        <Field
                          as="select"
                          name="bulkAssignTo"
                          className="dropdown_toggle w-100 "
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
                          className="error"
                        />
                      </div>
                    </div>

                    <div className="sms-generate_btn sms-add_same">
                      <button type="submit" className="theme_btn">
                        <img src="/SVG/generate-vec.svg" alt="g1" /> Generate
                        Subtasks
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubtaskManagementBulk;
