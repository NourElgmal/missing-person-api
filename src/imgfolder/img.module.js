const mongoose = require("mongoose");
const Ipclass = require("../../utils/ipclass");

const imgSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  Where_find_him: { type: String },
  When_find_him: { type: String },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  img_url: { type: String },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User_model",
  },
  similar: { type: Boolean, default: false },
  similar_img_url: { type: String, default: null },
  id_user_similar: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "User_model",
  },
  found: {
    type: Boolean,
    default: false,
  },
  foundormiss: {
    type: String,
    required: true,
  },
  police_address: {
    type: String,
    default: null,
  },
  resiv_time: {
    type: String,
    default: "Unspecified",
  },
  updateAt: {
    type: Date,
    default: new Date(),
  },
  updated: {
    type: Boolean,
    default: false,
  },
  Time_is_up: {
    type: Boolean,
    default: false,
  },
});
//const ip = Ipclass.IP.toString(); // ? Ipclass.IP : "192.168.1.20";
//console.log(ip);
imgSchema.set("toJSON", { virtuals: true });
imgSchema.set("toObject", { virtuals: true });
imgSchema.virtual("img_url_full").get(function () {
  return (
    "http://" +
    Ipclass.IP.toString() +
    ":3000/user/" +
    this.img_url.split("\\").pop()
  );
});
imgSchema.virtual("similar_img_url_full").get(function () {
  if (this.similar_img_url)
    return (
      "http://" +
      Ipclass.IP.toString() +
      ":3000/user/" +
      this.similar_img_url.split("\\").pop()
    );
  else return null;
});

const imgModule = mongoose.model("Image", imgSchema);

module.exports = imgModule;
