// import multer from "multer";
// import path from "path";

// // Storage config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let folder = "uploads/";
//     if (file.fieldname === "profile_pic") folder += "employees/";
//     else folder += "subtasks/";
//     cb(null, folder);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `${Date.now()}-${file.fieldname}${ext}`);
//   },
// });

// // Filter (allow jpg, png, pdf)
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only jpg, png, pdf allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

// export default upload;

// upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Create storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "crm";
    if (file.fieldname === "profile_pic") folder += "/employees";
    else folder += "/subtasks";

    return {
      folder,
      resource_type: "auto", // auto: images, pdfs etc.
      format: undefined, // keep original format
      public_id: `${Date.now()}-${file.fieldname}`, // optional custom filename
    };
  },
});

// Filter (keep your existing filter)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, png, pdf allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
