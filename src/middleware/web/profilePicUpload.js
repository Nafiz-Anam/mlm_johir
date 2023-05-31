const util = require("util");
const multer = require("multer");
const path = require("path");
const maxSize = 2 * 1024 * 1024;
const fs = require("fs");

const fileUploadDirectory = path.join(
  __dirname,
  "../..",
  "/uploads/images/profilePic"
);

let storage = multer.diskStorage({
  destination: (req, image, cb) => {
    fs.access(fileUploadDirectory, function (error) {
      if (error) {
        fs.mkdir(fileUploadDirectory, { recursive: true }, (err) => {});
        return cb(null, fileUploadDirectory);
      } else {
        return cb(null, fileUploadDirectory);
      }
    });
  },
  filename: (req, image, cb) => {
    const filename = image.originalname
      .substring(0, image.originalname.lastIndexOf("."))
      .replace(/ /g, "_");
    cb(
      null,
      filename +
        "-" +
        new Date().valueOf() +
        "." +
        image.mimetype.split("/").reverse()[0]
    );
  },
});

let uploadFile = multer({
  storage: storage,
  limits: {
    fileSize: maxSize,
  },
  fileFilter: (req, image, callback) => {
    var ext = path.extname(image.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".pdf" && ext !== ".jpeg") {
      return callback(new Error("Only images jpg|jpeg|png|pdf are allowed"));
    }
    callback(null, true);
  },
}).single("image");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;
