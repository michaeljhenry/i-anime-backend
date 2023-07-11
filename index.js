const path = require("path");
const express = require("express");

const bodyParser = require("body-parser");
const userRoutes = require("./routes/users-routes");
const animeRoutes = require("./routes/animes-routes");
const HttpError = require("./models/http-error");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images"))); // just returns a file.  // path.join builds a new path pointing @ that folder

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/animes", animeRoutes);

app.use("*", (req, res, next) => {
  /*
    res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server!`
    });
    */
  const err = new HttpError("Could not find this route", 404);

  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.code || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-vp3uo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    // console.log(err);
  });
