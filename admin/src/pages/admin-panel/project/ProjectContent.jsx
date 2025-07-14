import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const ProjectContent = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currencyOptions = ["INR", "USD", "EUR"];

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
        );
        if (res.data.success) {
          console.log("Project data:", res.data.project);
          setProject(res.data.project);
        } else {
          toast.error("Failed to load project");
        }
      } catch (err) {
        console.error("Fetch project error:", err);
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <section className="pc">
      <section className="pc-header">
        <div className="pc-header-inner">
          <div className="pc-back-overview">
            <img src="/SVG/arrow-pc.svg" alt="back" />
            <span>Back to Client Overview</span>
          </div>
          <div className="pc-edit-content">
            <span>
              Last updated on{" "}
              {project ? new Date(project.updatedAt).toLocaleDateString() : "-"}
            </span>
            <div className="pc-edit-content-btn">
              <a href={`/editprojectcontent/${projectId}`}>
                <img src="/SVG/edit-white.svg" alt="edit" />
                Edit
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="pc-main-content">
        <div className="pc-content-inner-txt">
          <h1>Project Content for {project?.name || "Loading..."}</h1>
          <span>Manage all project content, items, and pricing details</span>
        </div>
      </section>

      <section className="pc-price-and-overview pc-sec-content">
        <div className="pc-item-price">
          <div className="pc-item-price-inner">
            <h2>Jewelry Items & Pricing</h2>
          </div>
          <div className="pc-item-table">
            {project?.content[0]?.items?.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Jewelry Item</th>
                    <th>Quantity</th>
                    <th>Price per Item (₹)</th>
                    <th>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {project.content[0].items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3">Sub Total</td>
                    <td>
                      {project.content[0].items.reduce(
                        (sum, i) => sum + i.quantity * i.price,
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p>No items added yet.</p>
            )}
          </div>
        </div>

        <div className="pc-pricing-overview">
          <div className="pc-prc-inner">
            <div className="prc-txt">
              <h2>Pricing Overview</h2>
            </div>

            <p>Currency</p>
            <div
              className={`pc-currancy-dropdown ${dropdownOpen ? "open" : ""}`}
              ref={dropdownRef}
            >
              <div
                className="pc-dropdown_toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="pc-text_btn">{currency}</span>
                <img
                  src="/SVG/header-vector.svg"
                  alt="arrow"
                  className="pc-arrow_icon"
                />
              </div>
              <ul className="pc-dropdown_menu">
                {currencyOptions.map((opt, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setCurrency(opt);
                      setDropdownOpen(false);
                    }}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pc-total-project-price">
            <p>Total Project Price</p>
            <span>₹{project?.content[0]?.total_price || 0}</span>
            <h5>Price Distribution</h5>
          </div>
        </div>
      </section>

      <section className="pc-content-include">
        <div className="pc-content-inner">
          <h2>Content Included</h2>
        </div>
        <div className="pc-photo-video">
          <div className="pc-content-photo">
            <div className="pc-photo-detail">
              <div className="photo-video-inner">
                <div className="not-completed-text">
                  <h3>Media</h3>
                  <p>Uploaded Media</p>
                </div>
              </div>
              <div className="pc-item-contain">
                <span>{project?.content[0]?.uploaded_files?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pc-notes-description">
        <div className="pc-not-des-inner">
          <h2>Project Notes / Description</h2>
        </div>
        <div className="pc-description">
          <span>
            {project?.content[0]?.description || "No description added."}
          </span>
        </div>
      </section>

      <section className="pc-media-preview">
        <div className="pc-media-preview-inner">
          <h2>Media Preview</h2>
          <a href={`/project/gallery/${projectId}`}>View All</a>
        </div>
        <div className="pc-media-pre-imgs">
          {project?.content[0]?.uploaded_files?.length > 0 ? (
            project.content[0].uploaded_files
              .slice(0, 3)
              .map((url, idx) => (
                <img key={idx} src={url} alt={`media${idx}`} />
              ))
          ) : (
            <p>No media uploaded.</p>
          )}
        </div>
      </section>
    </section>
  );
};

export default ProjectContent;
