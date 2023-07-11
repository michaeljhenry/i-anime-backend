const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const animeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  synopsis: { type: String, required: false },
  image_url: { type: String, required: true },
  mal_id: { type: Number, required: false },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" }, //ref establishes connection between schemas,
  type: { type: String, required: true },
  score: { type: String, required: false }, // a string because 0 is falsey as a number in the frontend. annoying for form with scores. parse to int if needed
});

module.exports = mongoose.model("Anime", animeSchema);
