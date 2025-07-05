import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Dropdown = ({ label, options, selected, setSelected }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`sms-add_path sms-add_same${open ? " open" : ""}`}>
      <span>{label}</span>
      <div
        className="sms-dropdown_toggle"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="sms-text_btn">{selected || `Select ${label}`}</span>
        <img
          src="/SVG/header-vector.svg"
          alt="vec"
          className="sms-arrow_icon"
        />
      </div>
      {open && (
        <ul className="sms-dropdown_menu">
          {options.map((option, i) => (
            <li
              key={i}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SubtaskFormGenerator = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const assignToOptions = ["em1", "em2", "em3"];
  const priorityOptions = ["Low", "Medium", "High"];
  const stageOptions = ["Design", "Render"];

  // Single subtask form
  const [singleSubtask, setSingleSubtask] = useState({
    task_name: "",
    description: "",
    path_to_files: "",
    stage: "",
    priority: "",
    asign_to: "", // store selected id/role
  });

  // Bulk generator form
  const [bulkPrefix, setBulkPrefix] = useState("");
  const [bulkStart, setBulkStart] = useState(1);
  const [bulkEnd, setBulkEnd] = useState(5);
  const [bulkStage, setBulkStage] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");
  const [bulkAssignTo, setBulkAssignTo] = useState("");

  const [mediaFiles, setMediaFiles] = useState([]); // store files
  const [mediaPreviews, setMediaPreviews] = useState([]); // store preview URLs

  // Add single subtask
  const handleAddSingle = async () => {
    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("task_name", singleSubtask.task_name);
      formData.append("description", singleSubtask.description);
      formData.append("stage", singleSubtask.stage);
      formData.append("priority", singleSubtask.priority);
      formData.append(
        "asign_to",
        JSON.stringify([{ role: "Employee", id: singleSubtask.asign_to }])
      );
      formData.append("path_to_files", singleSubtask.path_to_files);
      formData.append("status", "To do");
      mediaFiles.forEach((file) => formData.append("media_files", file));

      await axios.post(`${process.env.REACT_APP_API_URL}/api/subtask/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Subtask added successfully!");
      navigate(`/subtaskdashboardcontainer/${projectId}`);
    } catch (error) {
      console.error("Error adding subtask:", error);
      alert("Failed to add subtask.");
    }
  };

  // Generate and add bulk subtasks
  const handleBulkGenerate = async () => {
    try {
      const newSubtasks = [];
      for (let i = bulkStart; i <= bulkEnd; i++) {
        newSubtasks.push({
          project_id: projectId,
          task_name: `${bulkPrefix} ${i}`,
          description: "",
          stage: bulkStage,
          priority: bulkPriority,
          asign_to: [{ role: "Employee", id: bulkAssignTo }],
          status: "To do",
        });
      }

      // Bulk insert: send one by one OR create bulk endpoint (simplest: send multiple requests)
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/add-bulk`,
        newSubtasks
      );

      alert("Bulk subtasks created successfully!");
      navigate(`/subtaskdashboardcontainer/${projectId}`);
    } catch (error) {
      console.error("Error generating bulk subtasks:", error);
      alert("Failed to generate subtasks.");
    }
  };

  return (
    <section className="sms-add_and_generator mg-auto">
      <div className="sms-add_and_generatoe_inner">
        {/* Single Subtask */}
        <div className="sms-add_new-task sms-add_gen-task">
          <div className="sms-add_task-inner">
            <div className="sms-add_task-heading">
              <h2>Add New Subtask</h2>
            </div>
            <div className="add-sub_task_main add-add_gen_main">
              <div className="sms-add_task-form">
                <div className="sms-add_name sms-add_same">
                  <span>Subtask Name</span>
                  <input
                    type="text"
                    placeholder="Subtask Name"
                    value={singleSubtask.task_name}
                    onChange={(e) =>
                      setSingleSubtask({
                        ...singleSubtask,
                        task_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="sms-add_task-form">
                <div className="sms-add_des sms-add_same">
                  <span>Description</span>
                  <input
                    type="text"
                    placeholder="Description"
                    value={singleSubtask.description}
                    onChange={(e) =>
                      setSingleSubtask({
                        ...singleSubtask,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="sms-add_task-form">
                <div className="sms-add_name sms-add_same">
                  <span>Path to file (Optional)</span>
                  <input
                    type="text"
                    placeholder="File path"
                    value={singleSubtask.path_to_files}
                    onChange={(e) =>
                      setSingleSubtask({
                        ...singleSubtask,
                        path_to_files: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Dropdown
                label="Assign To"
                options={assignToOptions}
                selected={singleSubtask.asign_to}
                setSelected={(v) =>
                  setSingleSubtask({ ...singleSubtask, asign_to: v })
                }
              />
              <Dropdown
                label="Priority"
                options={priorityOptions}
                selected={singleSubtask.priority}
                setSelected={(v) =>
                  setSingleSubtask({ ...singleSubtask, priority: v })
                }
              />
              <Dropdown
                label="Stage"
                options={stageOptions}
                selected={singleSubtask.stage}
                setSelected={(v) =>
                  setSingleSubtask({ ...singleSubtask, stage: v })
                }
              />
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
                      if (files.length > 0) {
                        setMediaFiles(files);
                        setMediaPreviews(
                          files.map((file) => URL.createObjectURL(file))
                        );
                      } else {
                        setMediaFiles([]);
                        setMediaPreviews([]);
                      }
                    }}
                  />

                  <a
                    href="#"
                    className="browse-file"
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
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {mediaPreviews.map((preview, idx) => (
                    <div key={idx}>
                      {/* detect if image or pdf */}
                      {preview.endsWith(".pdf") ? (
                        <embed
                          src={preview}
                          width="80"
                          height="80"
                          type="application/pdf"
                        />
                      ) : (
                        <img
                          src={preview}
                          alt={`preview-${idx}`}
                          style={{ maxWidth: "80px", maxHeight: "80px" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="sms-final_btns">
                <div className="sms-reset-btn">
                  <a
                    href="#"
                    onClick={() =>
                      setSingleSubtask({
                        task_name: "",
                        description: "",
                        path_to_files: "",
                        stage: "",
                        priority: "",
                        asign_to: "",
                      })
                    }
                  >
                    Reset Form
                  </a>
                </div>
                <div className="sms-save-btn">
                  <a href="#" onClick={handleAddSingle}>
                    Save Subtask
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk generator */}
        <div className="sms-generate_task sms-add_gen-task">
          <div className="sms-add_task-inner">
            <div className="sms-add_task-heading">
              <h2>Bulk Subtask Generator</h2>
            </div>
            <div className="sms-add_task-form add-add_gen_main">
              <div className="sms-add_subfix sms-add_same">
                <span>Subtask Prefix</span>
                <input
                  type="text"
                  placeholder="e.g., Ring"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                />
              </div>
              <div className="sms-add_number sms-add_same">
                <div className="add_num-1 sms-add_same">
                  <span>Start Number</span>
                  <input
                    type="number"
                    placeholder="1"
                    value={bulkStart}
                    onChange={(e) => setBulkStart(Number(e.target.value))}
                  />
                </div>
                <div className="add_num-1 sms-add_same">
                  <span>End Number</span>
                  <input
                    type="number"
                    placeholder="100"
                    value={bulkEnd}
                    onChange={(e) => setBulkEnd(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="sms-comman-setting">
                <h3>Common Settings for Generated Subtasks</h3>
                <Dropdown
                  label="Stage"
                  options={stageOptions}
                  selected={bulkStage}
                  setSelected={setBulkStage}
                />
                <Dropdown
                  label="Priority"
                  options={priorityOptions}
                  selected={bulkPriority}
                  setSelected={setBulkPriority}
                />
                <Dropdown
                  label="Assign To"
                  options={assignToOptions}
                  selected={bulkAssignTo}
                  setSelected={setBulkAssignTo}
                />
              </div>

              <div className="sms-generate_btn sms-add_same">
                <a href="#" onClick={handleBulkGenerate}>
                  <img src="/SVG/generate-vec.svg" alt="g1" /> Generate Subtasks
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubtaskFormGenerator;
