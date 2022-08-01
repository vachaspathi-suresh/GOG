import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  IconButton,
  Box,
  Tooltip,
  Avatar as MuiAvatar,
  Container,
} from "@mui/material";
import { Autorenew } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { setAvatarRoute, getAvatarsRoute } from "../../utils/APIRoutes";
import { userActions } from "../../store/user";
import useHTTP from "../../hooks/use-http";

import Loader from "../UI/Loader";

const toastOptions = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

const Avatar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const {
    isLoading: setLoading,
    clearError: setClearError,
    sendRequest: setSendRequest,
  } = useHTTP();
  const {
    isLoading: getLoading,
    clearError: getClearError,
    sendRequest: getSendRequest,
  } = useHTTP();
  const isLogged = useSelector((state) => state.auth.isLoggedIn);
  const uname = useSelector((state) => state.user.username);
  const name = useSelector((state) => state.user.name);
  useEffect(() => {
    if (!isLogged) {
      navigate("/auth");
    }
  }, [isLogged, navigate]);
  const token = useSelector((state) => state.auth.token);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      try {
        const responseData = await setSendRequest(
          setAvatarRoute,
          "POST",
          JSON.stringify({
            avatarId: avatars[selectedAvatar]._id,
          }),
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        );
        dispatch(userActions.setAvatar(responseData.avatar));
        localStorage.setItem(
          "gog-user-data",
          JSON.stringify({
            name: name,
            uname: uname,
            avatar: responseData.avatar,
          })
        );
        navigate("/");
      } catch (err) {
        toast.error(err.message, {
          ...toastOptions,
          onClose: () => {
            setClearError();
          },
        });
      }
    }
  };

  useEffect(() => {
    const data = [];
    const getAvatars = async () => {
      const response = await getSendRequest(getAvatarsRoute, "POST", null, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      });
      for (let i = 0; i < 6; i++) {
        data.push(response.avatar[i]);
      }
      setAvatars(data);
    };
    try {
      getAvatars();
    } catch (err) {
      toast.error(err.message, toastOptions);
    }
  }, [getSendRequest, token]);

  const reload = async () => {
    const data = [];
    try {
      const response = await getSendRequest(getAvatarsRoute, "POST", null, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      });
      for (let i = 0; i < 6; i++) {
        data.push(response.avatar[i]);
      }
      setAvatars(data);
    } catch (err) {
      toast.error(err.message, {
        ...toastOptions,
        onClose: () => {
          getClearError();
        },
      });
    }
  };

  return (
    <>
      {getLoading ? (
        <Loader />
      ) : (
        <Container
          component="main"
          maxWidth="md"
          sx={{
            marginTop: 8,
            padding: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Typography variant="h2" sx={{ color: "#427578", ml: 5 }}>
              Select an Avatar
            </Typography>
            <Tooltip title="Refresh Avatars">
              <IconButton onClick={reload} sx={{ m: "1rem" }}>
                <Autorenew sx={{ fontSize: "2.5rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1.5}
          >
            {avatars.map((avatar, index) => (
              <Grid
                justifyContent="center"
                alignItems="center"
                item
                xs
                key={avatar._id}
              >
                <MuiAvatar
                  alt="avatar"
                  src={`data:image/png;base64,${avatar.data}`}
                  sx={{
                    cursor: "pointer",
                    width: 98,
                    height: 98,
                    bgcolor: selectedAvatar === index ? "#7BA9AD" : "#A6E3E9",
                    border: selectedAvatar === index && "0.4rem solid #4E6B6E",
                  }}
                  onClick={() => {
                    setSelectedAvatar(index);
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            size="large"
            sx={{ m: 5 }}
            onClick={setProfilePicture}
          >
            {setLoading ? "Adding Avatar..." : "Continue"}
          </Button>
        </Container>
      )}
    </>
  );
};

export default Avatar;
