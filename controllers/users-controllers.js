const express = require("express");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

DUMMY_USERS = [
  {
    name: "mike",
    email: "test@test.com",
    password: "whadup",
    uid: "u1",
  },
  {
    name: "test",
    email: "test23@test.com",
    password: "tester",
    uid: "u2",
  },
];
//
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); // no specific email or anything to find; take everything. but don't return the password in the returned data.
  } catch (err) {
    return next(new HttpError("No users found."));
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) }); // turn the mongodb returned data into an actual object i guess. getters: true turns the _id into a regular id
};

const searchUsers = async (req, res, next) => {
  let users;
  let nameSearched = req.params.name;
  let i;
  let newUsersArray;

  try {
    users = await User.find(
      { name: { $regex: new RegExp("^" + nameSearched.toLowerCase(), "i") } },
      "-password"
    ); // no specific email or anything to find; take everything. but don't return the password in the returned data.
  } catch (err) {
    return next(new HttpError("No users found."));
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) }); // turn the mongodb returned data into an actual object i guess. getters: true turns the _id into a regular id
};

const signup = async (req, res, next) => {
  //console.log('we got here');
  console.log(req.file);
  console.log(req.body);
  let existingUser;
  try {
    existingUser = await User.find({
      email: { $regex: new RegExp("^" + req.body.email.toLowerCase(), "i") },
    });
  } catch (err) {
    return next(new HttpError("Sorry, something went wrong.", 500));
  }
  //console.log(existingUser);
  if (existingUser.length > 0) {
    return next(new HttpError("User with this email already exists.", 400));
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12); // 2nd parameter represents the strength of the hash
  } catch (err) {
    const error = new HttpError(
      "Could not create near user, please try again.",
      500
    );
    return next(error);
  }
  const createdUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    image: req.file.key,
    //image: req.file.path, // http://localhost:5000/api/users/signup + req.file.path -> first part will be appended on the frontend. that will be the full url used on the frontend as the img src
    animes: [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Sorry, something went wrong.", 500));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later", 500)
    );
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({
      email: { $regex: new RegExp("^" + req.body.email.toLowerCase(), "i") },
    });
  } catch (err) {
    return next(new HttpError("Invalid credentials. Please try again", 400));
  }
  if (!existingUser) {
    return next(
      new HttpError("Invalid credentials. Please try new inputs", 400)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password); // compared stored hashed password to frontend password
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials, could not log you in");
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later", 500)
    );
  }

  res
    .status(201)
    .json({ id: existingUser.id, email: existingUser.email, token: token });
};

const getUserById = async (req, res, next) => {
  const id = req.params.id;
  let existingUser;
  try {
    existingUser = await User.findById(id);
  } catch (err) {
    return next(
      new HttpError("Something went wrong. Please try again later.", 500)
    );
  }
  if (!existingUser) {
    return next(new HttpError("No user with this ID"), 400);
  }

  res.status(201).json(existingUser);
};

const editProfile = async (req, res, next) => {
  let existingUser;
  try {
    existingUser = await User.findOne({ _id: req.body.creator });
  } catch (err) {
    return next(
      new HttpError("Something went wrong. Please try again later.", 500)
    );
  }
  if (!existingUser) {
    return next(new HttpError("No user found with that ID", 400));
  }
  if (!req.file) {
    return next(new HttpError("No file detected. Please try again.", 400));
  }

  existingUser.image = req.file.key;
  try {
    await existingUser.save();
  } catch (err) {
    return next(new HttpError("Something went wrong Please try again.", 500));
  }
  res.json({ message: "success" });
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.searchUsers = searchUsers;
exports.signup = signup;
exports.login = login;
exports.editProfile = editProfile;
