const { workerData, parentPort } = require("worker_threads");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const path = require("path");
const fs = require("fs");

// ربط canvas بـ face-api.js
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
});

(async () => {
  try {
    // تحميل الموديلات
    const MODEL_URL = path.join(__dirname, "models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);

    const { imagePath } = workerData;

    // تحميل الصورة
    const imgBuffer = fs.readFileSync(imagePath);
    const img = await canvas.loadImage(imgBuffer);

    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    parentPort.postMessage({ status: "done", detections });
  } catch (error) {
    parentPort.postMessage({ status: "error", error: error.message });
  }
})();
