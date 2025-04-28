const mongoose = require("mongoose");
const schema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User_model",
  },
  img_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
  },
  img_url: String,
  img_feature: {
    type: [Number],
  },
});
module.exports = mongoose.model("img_feature", schema);
