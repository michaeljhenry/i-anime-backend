const express = require("express");
const router = express.Router();
const animesController = require("../controllers/animes-controllers");
const checkAuth = require("../middleware/check-auth");

router.get("/:aid", animesController.getAnimeById);

router.get("/user/:uid", animesController.getAnimesByUserId); // if i had just /:uid it would interfere with the above route and this route would never be reached.

router.get("/user/:uid/animes/watched", animesController.getAnimesWatched);

router.get("/user/:uid/animes/toWatch", animesController.getAnimesToWatch);

router.get("/user/:uid/animes/watching", animesController.getAnimesWatching);

router.get("/user/:uid/animes/dropped", animesController.getAnimesDropped);

router.use(checkAuth);

router.post("/add", animesController.addAnime);

router.patch("/patch/type/:aid", animesController.patchType);

router.patch("/patch/:aid", animesController.patchAnimes);

router.delete("/delete/:aid", animesController.deleteAnime);

module.exports = router;
