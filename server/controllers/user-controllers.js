const HttpError = require("../models/http-error");
const User = require("../models/user-model");
const Avatar = require("../models/avatar-model");
const transporter = require("../models/nodemailer-model.js");
const shuffle = require("../utils/RandomGenerator");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const addAvatar = async (req, res, next) => {
  const newAvatar = new Avatar({
    data: req.body.data,
  });
  try {
    await newAvatar.save();
    res.json({ done: "done" });
  } catch (err) {
    return next(new HttpError("fail", 500));
  }
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  let existingUser;
  try {
    existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  if (existingUser) {
    let error;
    if (existingUser.email === req.body.email) {
      error = new HttpError(
        "Account with Email already exists, Please Login.",
        422
      );
    } else {
      error = new HttpError("Username Already Taken, Please try another", 422);
    }
    return next(error);
  }

  let hashedPassword;
  let defAvatar;
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12);
    defAvatar = await Avatar.findById("62dd90c828e0704d64014f77");
  } catch (err) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  const newUser = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    avatarImage: defAvatar.data,
    friends: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  res.status(201).json({
    userId: newUser.id,
    name: newUser.name,
    username: newUser.username,
    token: token,
  });
};

const login = async (req, res, next) => {
  let existingUser;

  try {
    existingUser = await User.findOne({
      $or: [{ email: req.body.username }, { username: req.body.username }],
    });
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  if (!existingUser) {
    const error = new HttpError("Invalid credentials.", 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  if (!isValidPassword) {
    return next(new HttpError("Invalid credentials.", 403));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  res.status(201).json({
    username: existingUser.username,
    avatar: existingUser.avatarImage,
    name: existingUser.name,
    userId: existingUser.id,
    token: token,
  });
};

const getUserNames = async (req, res, next) => {
  try {
    const users = await User.find({});
    const usernames = users.map((user) => {
      return user.username;
    });
    res.status(200).json({ usernames });
  } catch (err) {
    return next(
      new HttpError("Unable to find Users, please try again later.", 500)
    );
  }
};

const getAvatars = async (req, res, next) => {
  try {
    const avatars = await Avatar.find({});
    const avatar = shuffle()
      .slice(0, 6)
      .map((n) => avatars[n]);
    res.status(200).json({ avatar });
  } catch (err) {
    return next(
      new HttpError("Unable to get Avatars, please try again later.", 500)
    );
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.userData.userID } });
    const usersData = users.map((user) => {
      return { username: user.username, name: user.name, uid: user.id };
    });
    res.status(200).json({ usersData });
  } catch (err) {
    return next(
      new HttpError("Unable to find Users, please try again later.", 500)
    );
  }
};

const delUser = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userID);
  } catch (err) {
    return next(
      new HttpError("Unable to Delete Account, please try again later.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  try {
    await User.findByIdAndDelete(req.userData.userID, () => {}).clone();
    await User.updateMany(
      { friends: user.id },
      { $pull: { friends: user.id } }
    );
    res.status(200).json({ uid: req.userData.userID });
  } catch (err) {
    return next(
      new HttpError("Unable to Delete Account, please try again later.", 500)
    );
  }
};

const changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid User, please select another.", 422));
  }

  let user;
  try {
    user = await User.findById(req.userData.userID);
  } catch (err) {
    return next(
      new HttpError("Unable to change password, please try again later.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(
      req.body.currPassword,
      user.password
    );
  } catch (err) {
    return next(
      new HttpError("Unable to change password, please try again later.", 500)
    );
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid Current Password.", 403);
    return next(error);
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);
    user.password = hashedPassword;
    user.save();
    res.status(200).json({ uid: user.id });
  } catch (err) {
    return next(
      new HttpError("Unable to change password, please try again.", 500)
    );
  }
};

const forgetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("User with Email not found.", 403));
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: req.body.email });
  } catch (err) {
    return next(
      new HttpError("Unable to Generate link, please try again later.", 500)
    );
  }

  if (!existingUser) {
    const error = new HttpError("User with Email not found.", 403);
    return next(error);
  }
  let token;
  try {
    const secret =
      process.env.TOKEN_SECRET + existingUser.password.slice(0, 10);
    token = jwt.sign({ uid: existingUser.id }, secret, {
      expiresIn: "15m",
    });
    token = "qwerty";
  } catch (err) {
    return next(
      new HttpError("Unable to Generate link, please try again later.", 500)
    );
  }
  const url = `${process.env.CLIENT_ORIGIN}/auth/reset-password?rsid=${existingUser.id}&ratuid=${token}`;
  const mailOptions = {
    from: "smashupchat@zohomail.in",
    to: existingUser.email,
    subject: "Reset your password",
    html: `<h1>Goblet of Games</h1><p>Hi ${existingUser.username},</p><p>We got a request to reset your GoG password</p><a href="${url}"><button style="background-color:blue;color:white;padding:10px;border:0;margin:1% 3%;width:94%;cursor:pointer;">Reset Password</button></a><br/><p>if you ignore this message, your password will not be changed.</p><p><strong>Note::</strong>The above link is only valid for 15 minutes</p>`,
  };

  try {
    await transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        return next(
          new HttpError("Unable to Generate link, please try again later.")
        );
      } else {
        res.status(200).json({ email: existingUser.email });
      }
    });
  } catch (err) {
    return next(
      new HttpError("Unable to Generate link, please try again later.", 500)
    );
  }
};

const verifyResetToken = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.body.uid);
  } catch (err) {
    return next(
      new HttpError("Unable to verify link, please try again later.", 500)
    );
  }

  if (!user) {
    const error = new HttpError("Invalid Link.", 403);
    return next(error);
  }
  try {
    const secret = process.env.TOKEN_SECRET + user.password.slice(0, 10);
    const decodeToken = jwt.verify(req.body.token, secret);
    res.status(200).json({ uid: decodeToken.uid });
  } catch (err) {
    return next(
      new HttpError("Unable to verify link, please try again later.", 500)
    );
  }
};
const resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Password", 422));
  }

  let user;
  try {
    user = await User.findById(req.body.uid);
  } catch (err) {
    return next(
      new HttpError("Unable to change password, please try again later.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  try {
    const secret = process.env.TOKEN_SECRET + user.password.slice(0, 10);
    jwt.verify(req.body.token, secret);
  } catch (err) {
    return next(
      new HttpError("Unable to verify link, please try again later.", 500)
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);
    user.password = hashedPassword;
    user.save();
    res.status(200).json({ uid: user.id });
  } catch (err) {
    return next(
      new HttpError("Unable to change password, please try again.", 500)
    );
  }
};

const setAvatar = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Avatar, please select another.", 422));
  }
  let selAvatar;
  try {
    selAvatar = await Avatar.findById(req.body.avatarId);
  } catch (err) {
    return next(
      new HttpError("Unable to set avatar, please try again later.", 500)
    );
  }
  if (!selAvatar) {
    return next(new HttpError("Invalid Avatar, please select another.", 422));
  }
  let user;
  try {
    user = await User.findByIdAndUpdate(
      req.userData.userID,
      {
        avatarImage: selAvatar.data,
      },
      { new: true }
    );
  } catch (err) {
    return next(
      new HttpError("Unable to set avatar, please try again later.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  res.status(200).json({ avatar: user.avatarImage });
};

exports.addAvatar = addAvatar;
exports.signUp = signUp;
exports.login = login;
exports.getUserNames = getUserNames;
exports.getUsers = getUsers;
exports.getAvatars = getAvatars;
exports.delUser = delUser;
exports.changePassword = changePassword;
exports.forgetPassword = forgetPassword;
exports.verifyResetToken = verifyResetToken;
exports.resetPassword = resetPassword;
exports.setAvatar = setAvatar;
