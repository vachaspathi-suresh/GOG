const friendControllers = require("../controllers/friend-controllers");
const authCheck = require("../middle-wares/auth-check");

const router = require("express").Router();
const { check } = require("express-validator");

router.use(authCheck);

router.post("/get-friends", friendControllers.getFriends);

router.post(
  "/delete-friend",
  [check("friendID").not().isEmpty()],
  friendControllers.deleteFriend
);

router.post(
  "/send-frequest",
  [check("friendID").not().isEmpty()],
  friendControllers.sendFriendRequest
);

router.post(
  "/accept-frequest",
  [check("friendID").not().isEmpty()],
  friendControllers.acceptFriendRequest
);

router.post("/get-frequests", friendControllers.getFriendRequests);

router.post("/get-requestedf", friendControllers.getRequestedFriends);

router.post(
  "/remove-frequest",
  [check("friendID").not().isEmpty()],
  friendControllers.removeFriendRequest
);

router.post(
  "/decline-frequest",
  [check("friendID").not().isEmpty()],
  friendControllers.declineFriendRequest
);

router.post("/get-online-friends", friendControllers.getOnlineFriends);

module.exports = router;
