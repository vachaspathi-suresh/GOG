export const baseRoute = "http://localhost:5000";

/*******************  user-routes *********************/

export const loginRoute = `${baseRoute}/api/auth/login`;
export const signupRoute = `${baseRoute}/api/auth/signup`;
export const getUserNamesRoute = `${baseRoute}/api/auth/get-usernames`;
export const setAvatarRoute = `${baseRoute}/api/auth/set-avatar`;
export const getUsersRoute = `${baseRoute}/api/auth/get-users`;
export const delAccountRoute = `${baseRoute}/api/auth/del-account`;
export const changePasswordRoute = `${baseRoute}/api/auth/new-pass`;
export const forgetPasswordRoute = `${baseRoute}/api/auth/forget-password`;
export const verifyResetRoute = `${baseRoute}/api/auth/verify-reset`;
export const resetPasswordRoute = `${baseRoute}/api/auth/reset-password`;
export const getAvatarsRoute = `${baseRoute}/api/auth/get-avatars`;

/*******************  friend-routes *********************/

export const getFriendsRoute = `${baseRoute}/api/friend/get-friends`;
export const delFriendRoute = `${baseRoute}/api/friend/delete-friend`;
export const sendFriendRequestRoute = `${baseRoute}/api/friend/send-frequest`;
export const acceptFriendRequestRoute = `${baseRoute}/api/friend/accept-frequest`;
export const getFriendRequestsRoute = `${baseRoute}/api/friend/get-frequests`;
export const getRequestedFriendsRoute = `${baseRoute}/api/friend/get-requestedf`;
export const removeFriendRequestRoute = `${baseRoute}/api/friend/remove-frequest`;
export const declineFriendRequestRoute = `${baseRoute}/api/friend/decline-frequest`;
export const getOnlineFriendsRoute = `${baseRoute}/api/friend/get-online-friends`;
