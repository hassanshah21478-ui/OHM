const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + ext);
  },
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only .jpg and .png files are allowed"), false);
  }
  cb(null, true);
};


const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, 
  fileFilter,
});

module.exports = upload;
