const express = require("express");
const router = express.Router();

const usersControllers = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");
const fileDelete = require("../middleware/file-delete");

router.get("/", usersControllers.getUsers);
router.get("/user/:id", usersControllers.getUserById);

router.get("/:name", usersControllers.searchUsers);

router.post(
  "/signup",
  fileUpload.single("image"), // single is one of the middlewares in fileUpload. retrieves a single file. incoming request should have an 'image' key in the body.
  usersControllers.signup
);

router.delete("/fileDelete", fileDelete, fileUpload.single("image"));

router.post(
  "/newUpload",
  fileUpload.single("image"),
  usersControllers.editProfile
);

router.post("/login", usersControllers.login);

module.exports = router;
