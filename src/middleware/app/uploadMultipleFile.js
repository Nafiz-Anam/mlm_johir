const util = require("util");
const multer = require("multer");
const path = require("path");
const maxSize = 2 * 1024 * 1024;
const fs = require("fs");

const fileUploadDirectory = path.join(
  __dirname,
  "../../",
  "/uploads/images/kyc"
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
  filename: (req, id_proof, cb) => {
    const filename = id_proof.originalname
      .substring(0, id_proof.originalname.lastIndexOf("."))
      .replace(/ /g, "_");
    cb(
      null,
      filename +
        "-" +
        new Date().valueOf() +
        //   "." +
        //   id_proof.mimetype.split("/").reverse()[0]
        path.extname(id_proof.originalname)
    );
  },
});

let multi_upload = multer({
  storage,
  limits: {
    fileSize: maxSize,
  },
  fileFilter: (req, id_proof, callback) => {
    var ext = path.extname(id_proof.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(new Error("Only images jpg|jpeg|png are allowed"));
    }
    callback(null, true);
  },
}).array("id_proof", 3);

let uploadMultipleFilesMiddleware = util.promisify(multi_upload);
module.exports = uploadMultipleFilesMiddleware;
