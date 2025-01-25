const mongoose = require("mongoose");
module.exports.Connect = () => {
  mongoose
    .connect(process.env.database, {})
    .then(() => console.log("MongoDB Connected..."))
    .catch((err) => console.log(err));
};
