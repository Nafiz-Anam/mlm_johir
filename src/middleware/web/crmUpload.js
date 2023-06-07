const util = require("util");
const multer = require("multer");
const path = require("path");
const maxSize = 2 * 1024 * 1024;
const fs = require("fs");

const fileUploadDirectory = path.join(__dirname, "../../uploads/images/crm");
// console.log(fileUploadDirectory);

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
  filename: (req, upload_doc, cb) => {
    const filename = upload_doc.originalname
      .substring(0, upload_doc.originalname.lastIndexOf("."))
      .replace(/ /g, "_");
    cb(
      null,
      filename +
        "-" +
        new Date().valueOf() +
        "." +
        upload_doc.mimetype.split("/").reverse()[0]
    );
  },
});

let uploadFile = multer({
  storage: storage,
  limits: {
    fileSize: maxSize,
  },
  fileFilter: (req, upload_doc, callback) => {
    var ext = path.extname(upload_doc.originalname);
    if (ext !== ".pdf" && ext !== ".ppt" && ext !== ".xls"  && ext !== ".docx" && ext !== ".txt" && ext !== ".xlsx" && ext !== ".png" && ext !== ".jpg" && ext !== ".doc" && ext !== ".jpeg") {
      return callback(new Error("Only images pdf|ppt|xls|xlsx|doc|docx|txtjpg|jpeg|png are allowed"));
    }
    callback(null, true);
  },
}).single("upload_doc");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;
