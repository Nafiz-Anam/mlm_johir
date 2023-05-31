const util = require("util");
const multer = require("multer");
const path = require("path");
const maxSize = 2 * 1024 * 1024;
const fs = require("fs");

const fileUploadDirectory = path.join(__dirname, "..", "/uploads/images/tickets");

let storage = multer.diskStorage({
  destination: (req, file_name, cb) => {
    fs.access(fileUploadDirectory, function (error) {
      if (error) {
        fs.mkdir(fileUploadDirectory, { recursive: true }, (err) => {});
        return cb(null, fileUploadDirectory);
      } else {
        return cb(null, fileUploadDirectory);
      }
    });
  },
  filename: (req, attachment, cb) => {
    const filename = attachment.originalname
      .substring(0, attachment.originalname.lastIndexOf("."))
      .replace(/ /g, "_");
    cb(
      null,
      filename +
        "-" +
        new Date().valueOf() +
        "." +
        attachment.mimetype.split("/").reverse()[0]
    );
  },
});

let uploadFile = multer({
  storage: storage,
  limits: {
    fileSize: maxSize,
  },
  fileFilter: (req, attachment, callback) => {
    var ext = path.extname(attachment.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(new Error("Only images jpg|jpeg|png are allowed"));
    }
    callback(null, true);
  },
}).single("attachment");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;
