// Employee Panel > Project Media Gallery
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ProjectMediaGallery = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const fetchProjectMedia = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`);
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

  const openModal = (index) => {
    setCurrentIndex(index);
    setImgLoaded(false);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  const goPrev = useCallback(() => {
    setImgLoaded(false);
    setCurrentIndex((i) => (i === 0 ? uploadedFiles.length - 1 : i - 1));
  }, [uploadedFiles.length]);

  const goNext = useCallback(() => {
    setImgLoaded(false);
    setCurrentIndex((i) => (i === uploadedFiles.length - 1 ? 0 : i + 1));
  }, [uploadedFiles.length]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isModalOpen, closeModal, goPrev, goNext]);

  /* touch swipe support for modal */
  const touchStartX = React.useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  return (
    <>
      <section className="w-full min-h-screen bg-gray-50">
        <div className="w-full p-3 sm:p-6">

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Project Media Gallery</h1>
                {uploadedFiles.length > 0 && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? "image" : "images"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
            {uploadedFiles.length > 0 ? (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
                {uploadedFiles.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group cursor-pointer"
                    onClick={() => openModal(idx)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors bg-gray-100">
                      <img
                        src={url}
                        alt={`media-${idx}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>

                    {/* Index badge */}
                    <div className="absolute top-1.5 right-1.5 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded font-medium leading-tight">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 font-medium">No media uploaded yet.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── Lightbox Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 text-white hover:text-gray-300 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          {uploadedFiles.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-2 sm:p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full"
              aria-label="Previous"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next */}
          {uploadedFiles.length > 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-2 sm:p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full"
              aria-label="Next"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image container */}
          <div className="flex flex-col items-center px-12 sm:px-16 max-w-5xl w-full">
            {!imgLoaded && (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              key={currentIndex}
              src={uploadedFiles[currentIndex]}
              alt={`media-${currentIndex}`}
              onLoad={() => setImgLoaded(true)}
              className={`max-w-full max-h-[75vh] sm:max-h-[82vh] object-contain rounded-lg transition-opacity duration-200 ${imgLoaded ? "opacity-100" : "opacity-0 absolute"}`}
            />

            {/* Caption */}
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-white text-sm font-medium">{currentIndex + 1} / {uploadedFiles.length}</p>
              <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">← → to navigate · Esc to close · swipe on mobile</p>
            </div>

            {/* Dot indicators (mobile only, max 20 images) */}
            {uploadedFiles.length > 1 && uploadedFiles.length <= 20 && (
              <div className="flex gap-1.5 mt-3 flex-wrap justify-center sm:hidden">
                {uploadedFiles.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setImgLoaded(false); setCurrentIndex(i); }}
                    className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-white" : "bg-gray-600"}`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectMediaGallery;