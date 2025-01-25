const { Auth } = require("../../utils/decoded_jwt");
const {
  getAllimg,
  getAllimgfound,
  getAllimgnotfound,
  getImgbyid,
  info_user_and_chaild,
  deleteimg,
  getmyupload,
} = require("./img.service");

const express = require("express").Router();
express.get("/img/getallimg", Auth, getAllimg);
express.get("/img/getallimgfound", Auth, getAllimgfound);
express.get("/img/getallimgnotfound", Auth, getAllimgnotfound);
express.get("/img/getImgbyid/:id", Auth, getImgbyid);
express.get("/img/info_user_and_chaild/:id", Auth, info_user_and_chaild);
express.delete("/img/delete_img/:id", Auth, deleteimg);
express.get("/img/myupload", Auth, getmyupload);
module.exports = express;
