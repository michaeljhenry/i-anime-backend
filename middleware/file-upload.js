const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const path = require("path");
const url = require("url");
const { v4: uuid } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: "us-east-2",
});

s3 = new aws.S3();

var fileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "anime-project-images",
    key: function (req, file, cb) {
      const ext = MIME_TYPE_MAP[file.mimetype]; // dynamically get the correct extension
      cb(null, file.originalname + Date.now() + "." + ext); //callback. could throw an error in first argument. second argument is the unique filename with the correct extension
    },
  }),
  limits: 500000, // 500k bytes limit
  fileFilter: (req, file, cb) => {
    // make sure we don't get an invalid file type
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

// const s3 = new aws.S3({
//   accessKeyId: "AKIAJMV2VHLRZYFIGBLQ",
//   secretAccessKey: "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",
//   Bucket: "anime-project-images",
//  });

//  const fileUpload = multer({ // pass a configuration object and it returns a group of middlewares.
//   limits: 500000, // 500k bytes limit
//   storage: multerS3({
//     s3: s3,
//     bucket: 'anime-project-images',
//     acl: 'public-read',
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype]; // dynamically get the correct extension
//       cb(null, uuid() + '.' + ext); //callback. could throw an error in first argument. second argument is the unique filename with the correct extension
//     }
//   }),
//   fileFilter: (req, file, cb) => { // make sure we don't get an invalid file type
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     let error = isValid ? null : new Error('Invalid mime type!');
//     cb(error, isValid);
//   }
// });

// const fileUpload = multer({ // pass a configuration object and it returns a group of middlewares.
//   limits: 500000, // 500k bytes limit
//   storage: multer.diskStorage({ // control how data gets stored
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/images'); //no error again. so null. 2nd argument is the folder where we want to store the data
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype]; // dynamically get the correct extension
//       cb(null, uuid() + '.' + ext); //callback. could throw an error in first argument. second argument is the unique filename with the correct extension
//     }
//   }),
//   fileFilter: (req, file, cb) => { // make sure we don't get an invalid file type
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     let error = isValid ? null : new Error('Invalid mime type!');
//     cb(error, isValid);
//   }
// });

module.exports = fileUpload;
