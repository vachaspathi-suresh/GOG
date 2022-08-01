import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import useHTTP from "../../hooks/use-http";
import { getUsersRoute, sendFriendRequestRoute } from "../../utils/APIRoutes";

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

const AddFriend = ({ allFriends, open, handleClose, addToRequested }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const { isLoading, sendRequest } = useHTTP();
  const {
    isLoading: addIsLoading,
    clearError: addClearError,
    sendRequest: addSendRequest,
  } = useHTTP();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const responseData = await sendRequest(getUsersRoute, "POST", null, {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        });
        setAllUsers(responseData.usersData);
        setAllUsers((prev) =>
          prev.filter(
            (user) => !allFriends.find((friend) => friend.uid === user.uid)
          )
        );
      } catch (err) {
        console.error(err);
      }
    };
    getUsers();
  }, [allFriends, sendRequest, token]);

  const filteredUsers =
    searchInput.trim().length === 0
      ? null
      : allUsers.filter((user) =>
          user.username.toLowerCase().includes(searchInput.toLowerCase())
        );

  const handleInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const addFriendHandler = async (user) => {
    try {
      const responseData = await addSendRequest(
        sendFriendRequestRoute,
        "POST",
        JSON.stringify({
          friendID: user.uid,
        }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      setSearchInput("");
      addToRequested(responseData);
      toast.success("Friend Request Sent", toastOptions);
    } catch (err) {
      toast.error(err.message, {
        ...toastOptions,
        onClose: () => {
          addClearError();
        },
      });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Friend</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please Enter The UserName of the Friend:
        </DialogContentText>
        {isLoading || addIsLoading ? (
          <h5>Loading..</h5>
        ) : (
          <>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              value={searchInput}
              onChange={handleInputChange}
              placeholder="@username"
              type="text"
              autoComplete="off"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchInput.trim().length !== 0 && (
                  <InputAdornment position="end">
                    <Clear
                      onClick={() => {
                        setSearchInput("");
                      }}
                      sx={{ cursor: "pointer" }}
                    />
                  </InputAdornment>
                ),
              }}
              variant="standard"
            />
            {filteredUsers &&
              (filteredUsers.length === 0 ? (
                <Typography>No User Found</Typography>
              ) : (
                <List>
                  {filteredUsers.map((user) => (
                    <ListItem disablePadding key={user.uid}>
                      <ListItemButton onClick={() => addFriendHandler(user)}>
                        <ListItemText
                          primary={user.username}
                          secondary={user.name}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFriend;
