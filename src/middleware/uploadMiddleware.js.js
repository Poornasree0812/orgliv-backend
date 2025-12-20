const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "orgliv_products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // allowed formats
  },
});

const upload = multer({ storage });

module.exports = upload;
