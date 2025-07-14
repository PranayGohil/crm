import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const CreateProjectContent = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [project, setProject] = useState("");
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
        );
        if (res.data.success && res.data.project.content) {
          const content = res.data.project.content;
          console.log("Contenet:", content);
          setProject(res.data.project);
          setItems(content[0].items?.length ? content[0].items : []);
          setTotalPrice(content[0].total_price || 0);
          setProjectDescription(content[0].description || "");
          setExistingFiles(content[0].uploaded_files || []);
        }
        console.log("Fetched project content:", res.data);
      } catch (err) {
        console.log("Error fetching project content:", err);
        console.error(err);
        toast.error("Failed to load project content");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [projectId]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === "name" ? value : Number(value);
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { name: "", quantity: 0, price: 0 }]);
  const deleteRow = (index) => setItems(items.filter((_, i) => i !== index));
  const resetRow = (index) =>
    setItems(
      items.map((item, i) =>
        i === index ? { name: "", quantity: 0, price: 0 } : item
      )
    );

  const getTotal = (q, p) => q * p;
  const getSubTotal = () =>
    items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const handleFileChange = (e) => setSelectedFiles([...e.target.files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) return toast.error("Please add at least one item.");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          items,
          total_price: totalPrice,
          description: projectDescription,
        })
      );
      selectedFiles.forEach((file) => formData.append("files", file));

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/project/content/${projectId}`,
        formData
      );
      if (res.data.success) {
        toast.success("Project content saved!");
        setExistingFiles(res.data.project.content.uploaded_files || []);
        setSelectedFiles([]);
        navigate(`/project/dashboard`);
      } else {
        toast.error("Failed to save content.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <section className="edit_project_content_container">
      <section className="epc-header">
        <div className="epc-header-inner">
          <div className="epc-back-overview">
            <span>Creating Project Content for </span>
            <span className="text-primary">{project.project_name}</span>
          </div>
        </div>
      </section>

      <section className="epc-edit-content-body">
        <div className="epc-edit-summary">
          <h2>Create Jewelry Summary</h2>
          <div className="epc-add-item-table">
            {items.length > 0 && (
              <table className="jwell-table">
                <thead>
                  <tr>
                    <th>Jewelry Item</th>
                    <th>Quantity</th>
                    <th>Price per Item (₹)</th>
                    <th>Total (₹)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(idx, "name", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(idx, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(idx, "price", e.target.value)
                          }
                        />
                      </td>
                      <td className="total">
                        ₹{getTotal(item.quantity, item.price)}
                      </td>
                      <td className="action">
                        <span
                          className="epc-delete-btn"
                          onClick={() => deleteRow(idx)}
                        >
                          <img src="/SVG/delete-vec.svg" alt="delete" />
                        </span>
                        <span
                          className="epc-reset-btn"
                          onClick={() => resetRow(idx)}
                        >
                          <img src="/SVG/refresh-vec.svg" alt="reset" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <a
              href="#"
              className="epc-add-btn"
              onClick={(e) => {
                e.preventDefault();
                addItem();
              }}
            >
              <img src="/SVG/plus-vec.svg" alt="plus" /> Add Item
            </a>
          </div>
        </div>

        <div className="epc-price-overview">
          <h2>Pricing Overview</h2>
          <div className="epc-overview-inner">
            <div className="epc-sub-total">
              <p>Subtotal</p>
              <span>₹{getSubTotal()}</span>
            </div>
            <div className="epc-total-price">
              <p>Total Project Price</p>
              <input
                type="number"
                value={totalPrice}
                onChange={(e) => setTotalPrice(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="epc-content-included">
          <h2>Content Included</h2>
          <div className="d-flex flex-wrap gap-4">
            {existingFiles.map((url, idx) => (
              <div key={idx}>
                <a href={url} target="_blank">
                  <img src={url} alt="uploaded" style={{ width: 100 }} />
                </a>
              </div>
            ))}
          </div>

          <div className="epc-drag-drop-files">
            <img src="/SVG/drag-drop-vec.svg" alt="drag" />
            <span>Drag and drop files here or</span>
            <label className="browse-btn">
              Browse Files
              <input type="file" multiple hidden onChange={handleFileChange} />
            </label>
          </div>
          <div className="epc-num-of-file-uploaded">
            <span>{selectedFiles.length}</span>
            <p>new files selected</p>
          </div>
        </div>

        <div className="epc-description-notes">
          <h2>Project Description / Notes</h2>
          <div className="epc-des-note-inner">
            <textarea
              className="epc-des-note-inner"
              rows={5}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="epc-final-btn">
          <div className="cancel-final-btn">
            <button
              className="theme_secondary_btn"
              onClick={(e) => {
                navigate(-1);
                e.preventDefault();
              }}
            >
              Cancel
            </button>
          </div>
          <div className="edit-final-btn">
            <button
              className="theme_btn"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <img src="/SVG/edit.svg" alt="create" /> Update Content
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default CreateProjectContent;
