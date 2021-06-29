const multer = require("multer");
const path = require("path");

const uploader = multer({
  storage: multer.diskStorage({
    filename: function (req, file, cb) {
      let ext = path.extname(file.originalname);
      cb(null, req.body.name + "-" + file.fieldname + "-" + Date.now() + ext);
    },
    destination: function (req, file, cb) {
      cb(null, "public/profile/");
    },
  }),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      req.isFileError = true;
      return cb(null, false);
    }
    cb(null, true);
  },
  onError: (err) => {
    console.log(err);
  },
});

module.exports = uploader;
