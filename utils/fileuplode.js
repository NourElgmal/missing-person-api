const multer = require("multer");
const fs = require("fs");
const path = require("path");
const AppErr = require("./Apperr");

module.exports.UplodefieldsFiles = (fieldname, foldername) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../uploads", foldername);

      // Check if the directory exists, and create it if not
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp for unique filenames
    },
  });

  return multer({ storage }).fields({ [fieldname]: 1 });
};
