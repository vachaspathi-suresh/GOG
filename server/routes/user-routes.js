const userControllers = require("../controllers/user-controllers");
const authCheck = require("../middle-wares/auth-check");

const router = require("express").Router();
const { check } = require("express-validator");

router.post("/add", userControllers.addAvatar);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("username").isLength({ min: 3 }),
    check("password").isLength({ min: 8 }),
  ],
  userControllers.signUp
);

router.post("/login", userControllers.login);

router.post("/get-usernames", userControllers.getUserNames);

router.post("/get-avatars", userControllers.getAvatars);

router.post(
  "/forget-password",
  [check("email").normalizeEmail().isEmail()],
  userControllers.forgetPassword
);

router.post("/verify-reset", userControllers.verifyResetToken);

router.post(
  "/reset-password",
  [check("newPassword").isLength({ min: 8 })],
  userControllers.resetPassword
);

router.use(authCheck);

router.post("/get-users", userControllers.getUsers);

router.post("/del-account", userControllers.delUser);

router.post(
  "/new-pass",
  [check("newPassword").isLength({ min: 8 })],
  userControllers.changePassword
);

router.post(
  "/set-avatar",
  [check("avatarId").not().isEmpty()],
  userControllers.setAvatar
);

module.exports = router;
