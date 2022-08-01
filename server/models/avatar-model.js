const mongoose = require("mongoose");

const avatarSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Avatar", avatarSchema);
