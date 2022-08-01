import React, { useState, useEffect } from "react";
import {
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { getOnlineFriendsRoute } from "../../utils/APIRoutes";
import useHTTP from "../../hooks/use-http";

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

function OnlineFriendsDialog({ open, handleClose, sendInvite }) {
  const token = useSelector((state) => state.auth.token);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const { isLoading: getFriendsIsLoading, sendRequest: getFriendsSendRequest } =
    useHTTP();

  useEffect(() => {
    const getFriends = async () => {
      try {
        const responseData = await getFriendsSendRequest(
          getOnlineFriendsRoute,
          "POST",
          null,
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        );
        setOnlineFriends(responseData.friends);
      } catch (err) {
        console.error(err);
        toast.error("Unable to get friends online", toastOptions);
      }
    };
    getFriends();
  }, [getFriendsSendRequest, token]);

  return (
    <Dialog
      open={open}
      sx={{
        "& .MuiDialog-paper": { bgcolor: "#E3FDFD" },
        "& ::-webkit-scrollbar": {
          width: "0.3rem",
        },
        "& ::-webkit-scrollbar-thumb": {
          bgcolor: "#71C9CE",
          borderRadius: "1rem",
        },
      }}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          bgcolor: "#CBF1F5",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          alignContent: "space-between",
        }}
      >
        <Typography sx={{ flexGrow: "1" }}>Friends Online</Typography>
      </DialogTitle>
      <DialogContent sx={{ marginTop: 1 }}>
        {getFriendsIsLoading ? (
          <Typography>Loading...</Typography>
        ) : onlineFriends.length > 0 ? (
          <List>
            {onlineFriends.map((friend) => (
              <ListItem sx={{ marginTop: 2, marginBottom: 2 }} key={friend.uid}>
                <ListItemAvatar>
                  <Avatar
                    alt={friend.username}
                    src={`data:image/png;base64,${friend.avatar}`}
                    sx={{ friend: "#A6E3E9" }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={friend.username}
                  secondary={friend.name}
                />
                <Chip
                  icon={<Add />}
                  label="Request"
                  variant="outlined"
                  sx={{ marginLeft: 2 }}
                  onClick={() => {
                    sendInvite(friend);
                    handleClose();
                  }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography marginTop={3} marginBottom={3}>
            No friends online
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default OnlineFriendsDialog;
