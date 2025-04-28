const fs = require("fs");
const path = require("path");

module.exports.deleteFile = (files, folder) => {
  fs.unlink(files, (err) => {
    if (err) {
      console.error(`Error deleting file: ${err.message}`);
      return;
    }
    console.log(`File ${files} was deleted successfully.`);
  });
};
