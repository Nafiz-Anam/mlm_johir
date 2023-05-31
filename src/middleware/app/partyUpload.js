const util = require("util");
const multer = require("multer");
const path = require("path");
const maxSize = 2 * 1024 * 1024;
const fs = require("fs");

const fileUploadDirectory = path.join(__dirname, "..", "/uploads/images/party");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.access(fileUploadDirectory, function (error) {
      if (error) {
        fs.mkdir(fileUploadDirectory, { recursive: true }, (err) => {});
        return cb(null, fileUploadDirectory);
      } else {
        return cb(null, fileUploadDirectory);
      }
    });
  },
  filename: (req, file, cb) => {
    const filename = file.originalname
      .substring(0, file.originalname.lastIndexOf("."))
      .replace(/ /g, "_");
    cb(
      null,
      filename +
        "-" +
        new Date().valueOf() +
        "." +
        file.mimetype.split("/").reverse()[0]
    );
  },
});

let uploadFile = multer({
  storage: storage,
  limits: {
    fileSize: maxSize,
  },
  fileFilter: (req, file, callback) => {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".doc" && ext !== ".jpeg") {
      return callback(new Error("Only images jpg|jpeg|png are allowed"));
    }
    callback(null, true);
  },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;
