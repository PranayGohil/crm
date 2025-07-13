import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ProjectMediaGallery = () => {
  const { projectId } = useParams();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const fetchProjectMedia = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
        );
        if (res.data.success && res.data.project?.content[0]?.uploaded_files) {
          setUploadedFiles(res.data.project.content[0].uploaded_files);
        } else {
          toast.error("No media found for this project.");
        }
      } catch (err) {
        console.error("Error fetching media:", err);
        toast.error("Failed to load project media.");
      }
    };
    fetchProjectMedia();
  }, [projectId]);

  return (
    <section className="pmg-project-media-gallary">
      <div className="pmg-project-media-main">
        <h1>Project Media Gallery</h1>
        <div className="pmg-project-gallary">
          {uploadedFiles.length > 0 ? (
            uploadedFiles.map((url, idx) => (
              <div className="pmg-gallary-img" key={idx}>
                <img src={url} alt={`media-${idx}`}  style={{ objectFit: "cover"}}  />
                <div className="pmg-media-icon">
                  <img src="/SVG/pmg-media-vec.svg" alt="media-type-icon" />
                </div>
              </div>
            ))
          ) : (
            <p>No media uploaded yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectMediaGallery;
