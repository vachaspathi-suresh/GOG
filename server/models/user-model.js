const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    max: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  avatarImage: {
    type: String,
    required: true,
  },
  friends: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  requests: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  requested: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
});

module.exports = mongoose.model("User", userSchema);
