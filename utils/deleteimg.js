const fs = require("fs");
const path = require("path");

module.exports.deleteFile = (files, folder) => {
  /*if (!Array.isArray(files)) {
    console.error("The 'files' argument should be an array.");
    return;
  }*/

  /*files.forEach((file) => {
    const filePath = path.join(__dirname, `../uploads/${folder}`, file);*/

  fs.unlink(files, (err) => {
    if (err) {
      console.error(`Error deleting file: ${err.message}`);
      return;
    }
    console.log(`File ${files} was deleted successfully.`);
  });
  // });
};
