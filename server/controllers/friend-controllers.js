const HttpError = require("../models/http-error");
const User = require("../models/user-model");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const getFriends = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userID).populate("friends");
  } catch (err) {
    return next(
      new HttpError("Unable to get friends, please try again later.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }
  try {
    const friends = user.friends.map((friend) => {
      friend = friend.toObject({ getters: true });
      return {
        name: friend.name,
        username: friend.username,
        avatar: friend.avatarImage,
        uid: friend.id,
      };
    });
    res.status(200).json({
      friends,
    });
  } catch (err) {
    return next(
      new HttpError("Unable to get friends, please try again later.", 500)
    );
  }
};

const deleteFriend = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid User, please select another.", 422));
  }

  try {
    const user = await User.findByIdAndUpdate(req.userData.userID, {
      $pull: { friends: req.body.friendID },
    });
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    const friend = await User.findByIdAndUpdate(req.body.friendID, {
      $pull: { friends: req.userData.userID },
    });
    if (!friend) {
      return next(new HttpError("Friend not found", 404));
    }
    res.status(200).json({ friend: req.body.friendID });
  } catch (err) {
    return next(
      new HttpError("Unable to remove Friend, please try again later.", 500)
    );
  }
};

const sendFriendRequest = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid User, please select another.", 422));
  }

  let user;
  try {
    user = await User.findById(req.userData.userID);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to send friend request, please try again later.",
        500
      )
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  let friend;
  try {
    friend = await User.findById(req.body.friendID);
  } catch (err) {
    return next(
      new HttpError(
        "Unable to send friend request, please try again later.",
        500
      )
    );
  }
  if (!friend) {
    return next(new HttpError("Invalid User, please select another.", 422));
  }
  try {
    if (user.friends.includes(friend.id)) {
      return next(new HttpError("Already a friend.", 422));
    } else if (user.requested.includes(friend.id)) {
      return next(new HttpError("Already request Sent", 422));
    } else if (user.requests.includes(friend.id)) {
      user.friends.push(friend);
      friend.friends.push(user);
      user.requests = user.requests.filter(
        (u) => u._id.toString() !== friend._id.toString()
      );
      friend.requested = friend.requested.filter(
        (u) => u._id.toString() !== user._id.toString()
      );
      friend.save();
      user.save();
    } else {
      user.requested.push(friend);
      friend.requests.push(user);
      user.save();
      friend.save();
    }
  } catch (err) {
    return next(
      new HttpError("Unable to add Friend, please try again later.", 500)
    );
  }
  res.status(200).json({
    name: friend.name,
    username: friend.username,
    avatar: friend.avatarImage,
    uid: friend.id,
  });
  const sid = onlineUsers.get(friend.id);
  if (sid && sid !== "") {
    ss.to(sid).emit("user-f-r", {});
  }
};

const acceptFriendRequest = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid User, please select another.", 422));
  }

  let user;
  try {
    user = await User.findById(req.userData.userID);
  } catch (err) {
    return next(
      new HttpError("Unable to add Friend, please try again later.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  let friend;
  try {
    friend = await User.findById(req.body.friendID);
  } catch (err) {
    return next(
      new HttpError("Unable to add friend, please try again later.", 500)
    );
  }
  if (!friend) {
    return next(new HttpError("Invalid User, please select another.", 422));
  }
  try {
    if (user.friends.includes(friend.id)) {
      return next(new HttpError("Already a friend.", 422));
    } else if (user.requests.includes(friend.id)) {
      user.friends.push(friend);
      friend.friends.push(user);
      user.requests = user.requests.filter(
        (u) => u._id.toString() !== friend._id.toString()
      );
      friend.requested = friend.requested.filter(
        (u) => u._id.toString() !== user._id.toString()
      );
      friend.save();
      user.save();
    } else {
      return next(new HttpError("Invalid request", 422));
    }
  } catch (err) {
    return next(
      new HttpError("Unable to add Friend, please try again later.", 500)
    );
  }
  res.status(200).json({
    friendName: friend.name,
    friendUsername: friend.username,
    friendAvatar: friend.avatarImage,
    friendUID: friend.id,
  });
};

const getFriendRequests = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userID).populate("requests");
  } catch (err) {
    return next(
      new HttpError("Unable to get requests, please try again later.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }
  try {
    const requests = user.requests.map((friend) => {
      friend = friend.toObject({ getters: true });
      return {
        name: friend.name,
        username: friend.username,
        avatar: friend.avatarImage,
        uid: friend.id,
      };
    });
    res.status(200).json({
      requests,
    });
  } catch (err) {
    return next(
      new HttpError("Unable to get requests, please try again later.", 500)
    );
  }
};

const getRequestedFriends = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userID).populate("requested");
  } catch (err) {
    return next(
      new HttpError("Unable to get requested, please try again later.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }
  try {
    const requested = user.requested.map((friend) => {
      friend = friend.toObject({ getters: true });
      return {
        name: friend.name,
        username: friend.username,
        avatar: friend.avatarImage,
        uid: friend.id,
      };
    });
    res.status(200).json({
      requested,
    });
  } catch (err) {
    return next(
      new HttpError("Unable to get requested, please try again later.", 500)
    );
  }
};

const removeFriendRequest = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid User, please select another.", 422));
  }

  try {
    const user = await User.findByIdAndUpdate(req.userData.userID, {
      $pull: { requested: req.body.friendID },
    });
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    const friend = await User.findByIdAndUpdate(req.body.friendID, {
      $pull: { requests: req.userData.userID },
    });
    if (!friend) {
      return next(new HttpError("request not found", 404));
    }
    res.status(200).json({ friend: req.body.friendID });
  } catch (err) {
    return next(
      new HttpError("Unable to remove request, please try again later.", 500)
    );
  }
};

const declineFriendRequest = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid User, please select another.", 422));
  }

  try {
    const user = await User.findByIdAndUpdate(req.userData.userID, {
      $pull: { requests: req.body.friendID },
    });
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    const friend = await User.findByIdAndUpdate(req.body.friendID, {
      $pull: { requested: req.userData.userID },
    });
    if (!friend) {
      return next(new HttpError("request not found", 404));
    }
    res.status(200).json({ friend: req.body.friendID });
  } catch (err) {
    return next(
      new HttpError("Unable to remove Friend, please try again later.", 500)
    );
  }
};

const getOnlineFriends = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userData.userID).populate("friends");
  } catch (err) {
    return next(
      new HttpError("Unable to get friends, please try again later.", 500)
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }
  try {
    const onlineF = user.friends.filter((friend) => {
      return onlineUsers.has(friend.id);
    });
    const friends = onlineF.map((friend) => {
      friend = friend.toObject({ getters: true });
      return {
        name: friend.name,
        username: friend.username,
        avatar: friend.avatarImage,
        uid: friend.id,
      };
    });
    res.status(200).json({
      friends,
    });
  } catch (err) {
    return next(
      new HttpError("Unable to get friends, please try again later.", 500)
    );
  }
};

exports.getFriends = getFriends;
exports.deleteFriend = deleteFriend;
exports.sendFriendRequest = sendFriendRequest;
exports.acceptFriendRequest = acceptFriendRequest;
exports.getFriendRequests = getFriendRequests;
exports.getRequestedFriends = getRequestedFriends;
exports.removeFriendRequest = removeFriendRequest;
exports.declineFriendRequest = declineFriendRequest;
exports.getOnlineFriends = getOnlineFriends;
