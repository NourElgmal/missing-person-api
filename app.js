process.on("uncaughtException", (e) => {
  console.error("Uncaught Exception:", {
    message: e.message,
    stack: e.stack,
  });
  process.exit(1);
});

const express = require("express");
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { Worker } = require("worker_threads");
const faceapi = require("face-api.js");
const canvas = require("canvas");
require("dotenv").config({ path: "./config/.env" });
const morgan = require("morgan");
const cors = require("cors");
const { Golbalmiddlware } = require("./utils/golbalmiddlware");
const { Auth } = require("./utils/decoded_jwt");
const AppErr = require("./utils/Apperr");
const imgModule = require("./src/imgfolder/img.module");
const userModule = require("./src/user/user.module");
const expressAsyncHandler = require("express-async-handler");
const { Notifications } = require("./utils/sendemail");
const img_feature = require("./src/imagefeatures/imagefeature.module");
const { deleteFile } = require("./utils/deleteimg");
const admin = require("firebase-admin");
const serviceAccount = require("./utils/missing-68668-firebase-adminsdk-fbsvc-4eb82cb703.json");
const { fairmassage } = require("./utils/notification");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
});

async function loadModels() {
  const MODEL_URL = path.join(__dirname, "models");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
}

const runFaceWorker = (imagePath) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "faceWorker.js"), {
      workerData: { imagePath },
    });
    worker.on("message", (msg) => {
      if (msg.status === "done") {
        resolve(msg.detections);
      } else {
        reject(new Error(msg.error));
      }
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/user"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const uploadDir = path.join(__dirname, "uploads", "user");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function compareFace(newImagePath, newFace) {
  const lastimgfeature = await img_feature.find();
  for (const storedImagePath of lastimgfeature) {
    const storedFace = new Float32Array(storedImagePath.img_feature);
    const distance = faceapi.euclideanDistance(newFace, storedFace);
    if (distance < 0.6) return storedImagePath.img_url;
  }
  return "not found";
}

loadModels().then(() => {
  app.use(express.static("uploads"));
  app.use(express.json());

  mongoose
    .connect(process.env.database)
    .then(() => console.log("Connected to MongoDB"));

  app.use(morgan("dev"));
  app.use(cors());
  app.use(require("./src/user/user.api"));
  app.use(require("./src/imgfolder/img.api"));

  app.post(
    "/Foundimg",
    upload.single("img"),
    Auth,
    expressAsyncHandler(async (req, res, next) => {
      try {
        let {
          name,
          age,
          Where_find_him,
          When_find_him,
          gender,
          foundormiss,
          police_address,
        } = req.body;

        if (!req.file) return next(new AppErr("All fields are required", 400));

        const imagePath = req.file.path;
        const img_url = path.join(__dirname, imagePath);

        if (
          !name ||
          !age ||
          !Where_find_him ||
          !When_find_him ||
          !gender ||
          !foundormiss
        ) {
          deleteFile(img_url);
          return next(new AppErr("All fields are required", 400));
        }

        if (foundormiss === "true" && !police_address) {
          deleteFile(img_url);
          return next(new AppErr("All fields are required", 400));
        }

        const id_user = req.id;
        const hasImages = await imgModule.countDocuments();
        let result = "not found";

        const newFaceDescriptor = await runFaceWorker(imagePath);

        if (!newFaceDescriptor || newFaceDescriptor.length === 0) {
          deleteFile(img_url);
          return next(new AppErr("No face detected in the image", 500));
        }

        const newFace = newFaceDescriptor[0].descriptor;
        await img_feature.create({
          user_id: id_user,
          img_feature: Array.from(newFace),
          img_url,
        });

        if (hasImages > 0) {
          result = await compareFace(imagePath, newFace);
        }

        if (result === "not found" || result === img_url) {
          const missing = await imgModule.create({
            name,
            age,
            Where_find_him,
            When_find_him,
            gender,
            img_url,
            id_user,
            foundormiss,
            police_address,
          });

          return res.send({
            message: "Image uploaded successfully",
            path: imagePath,
            info: missing,
          });
        }

        const user = await imgModule
          .findOne({ img_url: result })
          .populate("id_user", "email phone");
        console.log("🧪 user found:", user);
        if (user) {
          console.log("🧪 user found in :", user);
          user.found = true;
          user.similar = true;
          user.similar_img_url = img_url;
          user.id_user_similar = id_user;
          if (police_address) {
            user.police_address = police_address;
          } else {
            console.log(user.police_address);
            police_address = user.police_address;
          }
          console.log("dcdmcdmdmmdm");
          Notifications(user.id_user.email, user.name, police_address);
          Notifications(req.email, name, police_address);
          await fairmassage(
            user.id_user.email,
            "person found",
            ` ${user.name} was found and the delivery location is in the department ${police_address}`
          );
          await fairmassage(
            req.email,
            "person found",
            ` ${name} was found and the delivery location is in the department ${police_address}`
          );
          await user.save();
        }

        const missingData = {
          name,
          age,
          Where_find_him,
          When_find_him,
          gender,
          img_url,
          id_user,
          similar: true,
          similar_img_url: result,
          foundormiss,
          police_address,
        };

        if (user && user.id_user) {
          missingData.id_user_similar = user.id_user;
        }

        const missing = await imgModule.create(missingData);

        res.status(200).send({
          message: "Image matched",
          path: result,
          info: missing,
        });
      } catch (error) {
        deleteFile(path.join(__dirname, req.file?.path || ""));
        await img_feature.findOneAndDelete({
          img_url: path.join(__dirname, req.file?.path || ""),
        });
        return next(new AppErr(error.message || error, 500));
      }
    })
  );

  app.use(Golbalmiddlware);
  app.listen(3000, () => console.log("Server is running on port 3000"));
});

process.on("unhandledRejection", (e) => {
  console.error("Unhandled Rejection:", e.stack);
  process.exit(1);
});
