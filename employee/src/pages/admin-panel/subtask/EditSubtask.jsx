import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { stageOptions, priorityOptions } from "../../../options";

const EditSubtask = () => {
  const { subtaskId } = useParams();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);

  const singleSchema = Yup.object({
    task_name: Yup.string().required("Subtask name is required"),
    stage: Yup.string().required("Stage is required"),
    priority: Yup.string().required("Priority is required"),
    assign_to: Yup.string().required("Assign To is required"),
    assign_date: Yup.string().required("Start date is required"),
    due_date: Yup.string().required("Due date is required"),
  });

  const [initialValues, setInitialValues] = useState({
    task_name: "",
    description: "",
    stage: "",
    priority: "",
    assign_to: "",
    assign_date: "",
    due_date: "",
  });

  // Fetch employees & subtask details
  useEffect(() => {
    const fetchData = async () => {
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
          stage: subtask.stage || "",
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
      }
    };
    fetchData();
  }, [subtaskId]);

  // Handle form submit
  const handleUpdate = async (values) => {
    try {
      const formData = new FormData();
      formData.append("task_name", values.task_name);
      formData.append("description", values.description);
      formData.append("stage", values.stage);
      formData.append("priority", values.priority);
      formData.append("assign_date", values.assign_date);
      formData.append("due_date", values.due_date);
      formData.append("assign_to", values.assign_to);

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
    }
  };

  return (
    <div className="subtask_management">
      <ToastContainer position="top-center" />
      <section className="sms-subtask-mng-header mg-auto">
        <div className="sms-header-inner">
          <div className="sms-heading-main">
            <a href="#" onClick={() => navigate(-1)}>
              <img src="/SVG/arrow-pc.svg" alt="" />
            </a>
            <div className="sms-heading-txt">
              <h1>Edit Subtask</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="sm-add-task sms-add_and_generator mg-auto">
        <div className="sm-add-task-inner sms-add_and_generatoe_inner">
          <div className="sms-add_new-task sms-add_gen-task">
            <div className="sms-add_task-inner">
              <div className="sms-add_task-heading">
                <h2>Edit Subtask</h2>
              </div>

              <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={singleSchema}
                onSubmit={handleUpdate}
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
                          name="assign_to"
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
                          name="assign_to"
                          component="div"
                          className="error"
                        />
                      </div>
                    </div>

                    <div className="anp-start_end-date sms-add_same">
                      <span className="anp-client-name-para">
                        Start Date - End Date
                      </span>
                      <div className="enp-date_input sms-add_same d-flex justify-content-around">
                        <div>
                          <Field type="date" name="assign_date" />
                          <ErrorMessage
                            name="assign_date"
                            component="div"
                            className="error"
                          />
                        </div>
                        <div>
                          <Field type="date" name="due_date" />
                          <ErrorMessage
                            name="due_date"
                            component="div"
                            className="error"
                          />
                        </div>
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
                      <button type="reset" className="theme_secondary_btn">
                        Reset Form
                      </button>
                      <button type="submit" className="theme_btn">
                        Update Subtask
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

export default EditSubtask;
