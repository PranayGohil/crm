import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay";

const ProjectContent = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);

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

  const currency = project?.content?.[0]?.currency || "INR";
  const totalPrice = project?.content?.[0]?.total_price || 0;

  return (
    <section className="pc">
      {loading && <LoadingOverlay />}

      <section className="pc-main-content">
        <div className="pc-content-inner-txt">
          <h1>Project Content for {project?.project_name || "Loading..."}</h1>
        </div>
      </section>

      <section className="pc-price-and-overview pc-sec-content">
        <div className="pc-item-price">
          <div className="pc-item-price-inner">
            <h2>Jewelry Items & Pricing</h2>
          </div>
          <div className="pc-item-table">
            {project?.content?.[0]?.items?.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Jewelry Item</th>
                    <th>Quantity</th>
                    <th>Price per Item ({currency})</th>
                    <th>Total ({currency})</th>
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
          </div>

          <div className="pc-total-project-price">
            <p>Total Project Price</p>
            <span>
              {currency} {totalPrice}
            </span>
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
                <span>
                  {project?.content?.[0]?.uploaded_files?.length || 0}
                </span>
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
            {project?.content?.[0]?.description || "No description added."}
          </span>
        </div>
      </section>

      <section className="pc-media-preview">
        <div className="pc-media-preview-inner">
          <h2>Media Preview</h2>
          <a href={`/gallery/${projectId}`}>View All</a>
        </div>
        <div className="pc-media-pre-imgs">
          {project?.content?.[0]?.uploaded_files?.length > 0 ? (
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
