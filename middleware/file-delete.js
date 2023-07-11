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

const deleteFiles = async (req, res, next) => {
  const oldImage = req.body.oldImage;
  /* if (
    !fileKeys ||
    !Array.isArray(fileKeys) ||
    (fileKeys && fileKeys.length == 0)
  ) {
    res.status(400);
    return res.json({ error: "Error! File keys not found." });
  }*/

  const deleteParam = {
    Bucket: "anime-project-images",
    Key: oldImage,
  };
  try {
    await s3.deleteObject(deleteParam, function (err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }

      res.status(200);
      return res.json({ msg: "Deleted!" });
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = deleteFiles;
