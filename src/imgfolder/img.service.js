const expressAsyncHandler = require("express-async-handler");
const imgModule = require("./img.module");
const AppErr = require("../../utils/Apperr");
const userModule = require("../user/user.module");
const { deleteFile } = require("../../utils/deleteimg");
const { Notifications } = require("../../utils/sendemail");
const img_feature = require("../imagefeatures/imagefeature.module");

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
  const feature = await img_feature.findOneAndDelete({ img_url: img.img_url });
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
module.exports.set_resive_time = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new AppErr("not found id", 404));
  }

  const { time } = req.body;
  if (!time) {
    return next(new AppErr("time is required", 400));
  }

  const user = req.id;

  const img = await imgModule
    .findOneAndUpdate(
      { _id: id, id_user: user, found: true },
      { resiv_time: time },
      { new: true }
    )
    .populate("id_user", "email")
    .populate("id_user_similar", "email");

  if (!img) {
    return next(new AppErr("Image not found with this id", 404));
  }

  const lostimg = await imgModule.findOneAndUpdate(
    { img_url: img.similar_img_url },
    { resiv_time: time },
    { new: true }
  );

  if (!lostimg) {
    return next(new AppErr("Lost image not found", 404));
  }

  Notifications(
    img.id_user.email,
    img.name,
    `${img.police_address} - I will be there at ${time}`
  );

  Notifications(
    img.id_user_similar.email,
    lostimg.name,
    `${img.police_address} - I will be there at ${time}`
  );

  res.status(200).json({ message: "Time set successfully" });
});
