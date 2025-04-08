const expressAsyncHandler = require("express-async-handler");
const imgModule = require("./img.module");
const AppErr = require("../../utils/Apperr");
const userModule = require("../user/user.module");
const { deleteFile } = require("../../utils/deleteimg");
module.exports.getAllimg = expressAsyncHandler(async (req, res, next) => {
  const img = await imgModule.find({ found: false });
  if (img.length <= 0) {
    return next(new AppErr("No images found"));
  }
  res.status(200).json(img);
});
module.exports.getAllimgfound = expressAsyncHandler(async (req, res, next) => {
  const img = await imgModule.find({ similar: true });
  if (img.length <= 0) {
    return next(new AppErr("No images found"));
  }
  res.status(200).json(img);
});
module.exports.getAllimgnotfound = expressAsyncHandler(
  async (req, res, next) => {
    const img = await imgModule.find({ similar: false });
    if (img.length <= 0) {
      return next(new AppErr("No images found"));
    }
    res.status(200).json(img);
  }
);

module.exports.getImgbyid = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new AppErr("not found id", 404));
  }
  const img = await imgModule.findById(id);
  res.status(200).json(img);
});
module.exports.info_user_and_chaild = expressAsyncHandler(
  async (req, res, next) => {
    const id = req.params.id;
    if (!id) {
      return next(new AppErr("not found id", 404));
    }
    const img = await imgModule
      .findById(id)
      .populate("id_user", "name email phone")
      .populate("id_user_similar", "name email phone");
    if (!img) {
      return next(new AppErr("not found img", 404));
    }
    res.status(200).json(img);
  }
);

module.exports.getmyupload = expressAsyncHandler(async (req, res, next) => {
  const id = req.id;
  const img = await imgModule.find({ id_user: id });
  if (img.length <= 0) {
    return next(new AppErr("No images found"));
  }
  res.status(200).json(img);
});
module.exports.deleteimg = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new AppErr("not found id", 404));
  }
  const img = await imgModule.findByIdAndDelete(id);
  if (!img) {
    return next(new AppErr("not found img", 404));
  }
  if (img.similar) {
    const similarimg = await imgModule.findOneAndUpdate(
      { img_url: img.similar_img_url },
      {
        similar: false,
        found: false,
        similar_img_url: null,
        id_user_similar: null,
      },
      { new: true }
    );
  }

  deleteFile(img.img_url, "user");
  res.status(200).json({ message: "Image deleted successfully" });
});
