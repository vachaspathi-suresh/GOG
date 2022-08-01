import React, { Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

import { useAuth } from "./hooks/use-auth";
import { authActions } from "./store/auth";
import { userActions } from "./store/user";
import { baseRoute } from "./utils/APIRoutes";
import Loader from "./components/UI/Loader";
import Home from "./pages/Home";
import { requestsAction } from "./store/requests";

const Auth = React.lazy(() => import("./pages/Auth"));
const SetAvatar = React.lazy(() => import("./pages/SetAvatar"));
const XOX = React.lazy(() => import("./components/Games/XOX"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Error = React.lazy(() => import("./pages/Error"));

const theme = createTheme({
  palette: {
    primary: {
      main: lightBlue["200"],
    },
    secondary: {
      main: lightBlue["700"],
    },
  },
});

function App() {
  const dispatch = useDispatch();
  const { token, login, logout, userId } = useAuth();
  const uid = useSelector((state) => state.auth.userId);
  const uname = useSelector((state) => state.user.username);
  const avatar = useSelector((state) => state.user.avatar);
  const socket = useSelector((state) => state.user.socket);
  const requestsCount = useSelector((state) => state.requests.friendRequests);

  useEffect(() => {
    dispatch(authActions.setIsLoggedIn(!!token));
    dispatch(authActions.setToken(token));
    dispatch(authActions.setUID(userId));
    dispatch(authActions.setLogin(login));
    dispatch(authActions.setLogout(logout));
    dispatch(authActions.setIsDark(false));
    if (!!token) {
      const storedData = JSON.parse(localStorage.getItem("gog-user-data"));
      const gameReq = JSON.parse(localStorage.getItem("gog-game-requests"));
      if (storedData) {
        dispatch(userActions.setAvatar(storedData.avatar));
        dispatch(userActions.setUsername(storedData.uname));
        dispatch(userActions.setName(storedData.name));
      }
      if (gameReq && gameReq.requests)
        dispatch(requestsAction.setGameRequests(gameReq.requests));
    }
  }, [dispatch, token, userId, login, logout]);

  useEffect(() => {
    dispatch(userActions.setSocket(io(baseRoute)));
  }, [dispatch]);

  useEffect(() => {
    if (!!token && uid && socket) {
      socket.emit("user-add", { uid, uname, avatar });
      socket.on("user-f-r", (data) => {
        dispatch(requestsAction.setFriendRequests(requestsCount + 1));
      });
      socket.on("user-invite-rec", (data) => {
        dispatch(requestsAction.addGameRequest(data));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, token, uid]);

  return (
    <ThemeProvider theme={theme}>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/auth"
            element={!!token ? <Navigate to="/" /> : <Auth />}
          />
          <Route path="/avatar" element={<SetAvatar />} />
          <Route path="/game/tic-tac-toe" element={<XOX />} />
          <Route
            path="/auth/forget-password"
            element={!!token ? <Navigate to="/" /> : <ForgotPassword />}
          />
          <Route
            path="/auth/reset-password"
            element={!!token ? <Navigate to="/" /> : <ResetPassword />}
          />
          <Route path="/*" element={<Error />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
