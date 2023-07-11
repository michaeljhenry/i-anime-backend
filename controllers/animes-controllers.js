const express = require("express");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const Anime = require("../models/anime");
const user = require("../models/user");

const DUMMY_ANIME = [
  {
    title: "Naruto",
    synopsis: `Moments prior to Naruto Uzumaki's birth, a huge demon known as the Kyuubi, the Nine-Tailed Fox`,
    image_url:
      "https://cdn.myanimelist.net/images/anime/13/17405.jpg?s=59241469eb470604a792add6fbe7cce6",
    creator: "u1",
    type: "toWatch",
    aid: "a1",
  },
  {
    title: "Bleach",
    synopsis:
      "Ichigo Kurosaki is an ordinary high schooler—until his family is attacked by a Hollow, a corrup",
    image_url:
      "https://cdn.myanimelist.net/images/anime/3/40451.jpg?s=3aa217eced217b3b4223af21c30fe2ed",
    creator: "u1",
    type: "watched",
    aid: "a2",
  },

  {
    title: "Bleac",
    synopsis:
      "Ichigo Kurosaki is an ordinary high schooler—until his family is attacked by a Hollow, a corrup",
    image_url:
      "https://cdn.myanimelist.net/images/anime/3/40451.jpg?s=3aa217eced217b3b4223af21c30fe2ed",
    creator: "u2",
    type: "toWatch",
    aid: "a3",
  },
  {
    title: "Narut",
    synopsis: `Moments prior to Naruto Uzumaki's birth, a huge demon known as the Kyuubi, the Nine-Tailed Fox`,
    image_url:
      "https://cdn.myanimelist.net/images/anime/13/17405.jpg?s=59241469eb470604a792add6fbe7cce6",
    creator: "u2",
    type: "watched",
    aid: "a4",
  },
];

const getAnimeById = async (req, res, next) => {
  const animeId = req.params.aid;
  //console.log(animeId);
  //const anime = DUMMY_ANIME.find((el) => el.aid === animeId);
  let anime;
  try {
    anime = await Anime.findById(animeId);
  } catch (err) {
    return next(new HttpError("Could not find the requested anime", 400));
  }
  res.json({ anime: anime });
};

const getAnimesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  let animes;
  //console.log('hi');

  try {
    user = await User.find({ _id: userId });
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 400)
    );
  }
  if (!user) {
    return next(new HttpError("Could not find the associated user", 400));
  }
  try {
    animes = await Anime.find({ creator: userId });
  } catch (err) {
    return next(new HttpError("Something went wrong", 400));
  }
  res.json({ animes });
};

const getAnimesWatched = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  let animes;
  try {
    user = await User.find({ creator: userId });
  } catch (err) {
    return next(new HttpError("Something went wrong"), 500);
  }
  if (!user) {
    return next(new HttpError("Could not find the associated user", 400));
  }
  try {
    animes = await Anime.find({ creator: userId, type: "watched" });
  } catch (err) {
    return next(new HttpError("Something went wrong", 400));
  }
  res.json({ animes });
};

const getAnimesToWatch = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  let animes;
  try {
    user = await User.find({ creator: userId });
  } catch (err) {}
  if (!user) {
    return next(new HttpError("Could not find the associated user", 400));
  }
  try {
    animes = await Anime.find({ creator: userId, type: "toWatch" });
  } catch (err) {
    return next(new HttpError("Something went wrong", 400));
  }
  res.json({ animes });
};

const getAnimesWatching = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  let animes;
  try {
    user = await User.find({ creator: userId });
  } catch (err) {
    return next(new HttpError("Something went wrong"), 500);
  }
  if (!user) {
    return next(new HttpError("Could not find the associated user", 400));
  }
  try {
    animes = await Anime.find({ creator: userId, type: "watching" });
  } catch (err) {
    return next(new HttpError("Something went wrong", 400));
  }
  res.json({ animes });
};

const getAnimesDropped = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  let animes;
  try {
    user = await User.find({ creator: userId });
  } catch (err) {
    return next(new HttpError("Something went wrong"), 500);
  }
  if (!user) {
    return next(new HttpError("Could not find the associated user", 400));
  }
  try {
    animes = await Anime.find({ creator: userId, type: "dropped" });
  } catch (err) {
    return next(new HttpError("Something went wrong", 400));
  }
  res.json({ animes });
};

const addAnime = async (req, res, next) => {
  const {
    title,
    description,
    image_url,
    synopsis,
    creator,
    type,
    score,
  } = req.body;
  let user;
  const createdAnime = new Anime({
    title,
    synopsis,
    description,
    image_url,
    type,
    creator,
    score,
  });
  try {
    user = await User.findById(creator); // search the database for the specified creator
  } catch (err) {
    return next(new HttpError("Something went wrong, try again later.", 500));
  }
  if (!user) {
    // make sure the creator actually exists
    return next(new HttpError("User did not exist", 400));
  }
  try {
    existingAnime = await Anime.find({ title, creator: creator }); // search to see if that anime is
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later.", 400)
    );
  }
  if (existingAnime.length !== 0) {
    // console.log('error is here');
    return next(new HttpError("That anime is already in your list", 400));
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdAnime.save({ session: sess });
    user.animes.push(createdAnime); // push is a mongoose method here and only adds the place id
    await user.save({ session: sess });
    await sess.commitTransaction(); // only @ this point are the changes actually saved. if one thing fails, all operations are rolled back
  } catch (err) {
    console.log(err);
    const error = new HttpError("Adding anime failed, please try again", 500);
    return next(error);
  }

  res.json({
    title: req.body.title,
    synopsis: req.body.title,
    image_url: req.body.image_url,
    creator: req.body.creator,
    aid: req.body.aid,
  });
};

const patchType = async (req, res, next) => {
  let animeId = req.params.aid;

  const { creator, type } = req.body;
  let user;
  let anime;
  try {
    user = await User.find({ creator });
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }

  if (!user) {
    return next(new HttpError("The associated user could not be found", 400));
  }
  try {
    anime = await Anime.findById(animeId);
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }
  if (!anime) {
    return next(new HttpError("Could not find the requested anime", 400));
  }
  //console.log(anime.creator.toString() == req.userData.userId);
  //console.log(req.userData.userId);

  if (anime.creator.toString() !== req.userData.userId && type === "toWatch") {
    return next(
      new HttpError("You are not authorized to change these details", 400)
    );
  }
  anime.type = type;
  try {
    await anime.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }

  res.status(200).json({ anime });
};

const patchAnimes = async (req, res, next) => {
  let animeId = req.params.aid;

  const { creator, description, score, type } = req.body;
  console.log(creator, description, score, type);
  let user;
  let anime;
  try {
    user = await User.find({ creator });
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }

  if (!user) {
    return next(new HttpError("The associated user could not be found", 400));
  }
  try {
    anime = await Anime.findById(animeId);
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }
  if (!anime) {
    return next(new HttpError("Could not find the requested anime", 400));
  }
  //console.log(anime.creator.toString() == req.userData.userId);
  //console.log(req.userData.userId);

  if (anime.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError("You are not authorized to change these details", 400)
    );
  }

  anime.description = description;
  anime.score = type === "toWatch" ? "" : score;
  anime.type = type;
  try {
    await anime.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }

  res.status(200).json({ anime });
};

const deleteAnime = async (req, res, next) => {
  let animeId = req.params.aid;

  const { creator, synopsis } = req.body;
  let user;
  let anime;
  try {
    anime = await Anime.findById(animeId).populate("creator"); // returns the anime along with the creator
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }
  if (!anime) {
    return next(new HttpError("Could not find the requested anime", 400));
  }
  //console.log(anime);
  //console.log(anime.creator);
  //console.log(req.userData.userId);

  if (anime.creator._id.toString() !== req.userData.userId) {
    // req.userData.userId was attached when passing check-auth. using this because it's secure due to token encoding?
    return next(
      new HttpError("You are not authorized to change delete this anime", 400)
    );
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await anime.remove({ session: sess });
    anime.creator.animes.pull(animeId); // push is a mongoose method here and only adds the place id
    await anime.creator.save({ session: sess });
    await sess.commitTransaction(); // only @ this point are the changes actually saved. if one thing fails, all operations are rolled back
  } catch (err) {
    const error = new HttpError("Deleting anime failed, please try again", 500);
    return next(error);
  }
  res.status(200).json({ anime });
};

exports.getAnimeById = getAnimeById;
exports.getAnimesByUserId = getAnimesByUserId;
exports.getAnimesWatched = getAnimesWatched;
exports.getAnimesToWatch = getAnimesToWatch;
exports.getAnimesWatching = getAnimesWatching;
exports.getAnimesDropped = getAnimesDropped;
exports.addAnime = addAnime;
exports.patchAnimes = patchAnimes;
exports.patchType = patchType;
exports.deleteAnime = deleteAnime;
