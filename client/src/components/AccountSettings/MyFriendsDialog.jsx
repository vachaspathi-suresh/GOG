import React, { useState, useEffect } from "react";
import {
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import {
  getFriendsRoute,
  getFriendRequestsRoute,
  getRequestedFriendsRoute,
  delFriendRoute,
  declineFriendRequestRoute,
  acceptFriendRequestRoute,
  removeFriendRequestRoute,
} from "../../utils/APIRoutes";
import useHTTP from "../../hooks/use-http";
import ConfirmDialog from "../UI/ConfirmDialog";
import {
  Add,
  GroupAdd,
  HighlightOff,
  RemoveCircleOutline,
} from "@mui/icons-material";
import AddFriend from "./AddFriend";
import { requestsAction } from "../../store/requests";

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

function MyFriendsDialog({ open, handleClose }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [requestedFriends, setRequestedFriends] = useState([]);
  const [rmFriend, setRmFriend] = useState(null);
  const { isLoading: getFriendsIsLoading, sendRequest: getFriendsSendRequest } =
    useHTTP();
  const { isLoading: getFriendRIsLoading, sendRequest: getFriendRSendRequest } =
    useHTTP();
  const {
    isLoading: getRFriendsIsLoading,
    sendRequest: getRFriendsSendRequest,
  } = useHTTP();
  const { clearError: delClearError, sendRequest: delSendRequest } = useHTTP();
  const { clearError: acceptClearError, sendRequest: acceptSendRequest } =
    useHTTP();
  const { clearError: removeClearError, sendRequest: removeSendRequest } =
    useHTTP();
  const { clearError: rejectClearError, sendRequest: rejectSendRequest } =
    useHTTP();

  useEffect(() => {
    const getFriends = async () => {
      try {
        const responseData = await getFriendsSendRequest(
          getFriendsRoute,
          "POST",
          null,
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        );
        setFriends(responseData.friends);
      } catch (err) {
        console.error(err);
      }
      try {
        const responseData = await getFriendRSendRequest(
          getFriendRequestsRoute,
          "POST",
          null,
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        );
        setFriendRequests(responseData.requests);
      } catch (err) {
        console.error(err);
      }
      try {
        const responseData = await getRFriendsSendRequest(
          getRequestedFriendsRoute,
          "POST",
          null,
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        );
        setRequestedFriends(responseData.requested);
      } catch (err) {
        console.error(err);
      }
    };
    getFriends();
  }, [
    getFriendRSendRequest,
    getFriendsSendRequest,
    getRFriendsSendRequest,
    token,
  ]);

  useEffect(() => {
    dispatch(requestsAction.setFriendRequests(friendRequests.length));
  }, [dispatch, friendRequests]);

  const unFriend = async () => {
    try {
      const responseData = await delSendRequest(
        delFriendRoute,
        "POST",
        JSON.stringify({
          friendID: rmFriend.uid,
        }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      setFriends((prev) =>
        prev.filter((friend) => friend.uid !== responseData.friend)
      );
      toast.success(
        `${rmFriend.username} is Removed from Friends List`,
        toastOptions
      );
    } catch (err) {
      toast.error(err.message, {
        ...toastOptions,
        onClose: () => {
          delClearError();
        },
      });
    }
  };

  const acceptRequest = async (friendId) => {
    try {
      const responseData = await acceptSendRequest(
        acceptFriendRequestRoute,
        "POST",
        JSON.stringify({
          friendID: friendId,
        }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      setFriends((prev) => [
        ...prev,
        {
          name: responseData.friendName,
          username: responseData.friendUsername,
          avatar: responseData.friendAvatar,
          uid: responseData.friendUID,
        },
      ]);
      setFriendRequests((prev) =>
        prev.filter((friend) => friend.uid !== responseData.friendUID)
      );
      toast.success(
        `${responseData.friendUsername} is added to your friends list`,
        toastOptions
      );
    } catch (err) {
      toast.error(err.message, {
        ...toastOptions,
        onClose: () => {
          acceptClearError();
        },
      });
    }
  };

  const removeRequest = async (friendId) => {
    try {
      const responseData = await removeSendRequest(
        removeFriendRequestRoute,
        "POST",
        JSON.stringify({
          friendID: friendId,
        }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      setRequestedFriends((prev) =>
        prev.filter((friend) => friend.uid !== responseData.friend)
      );
      toast.success("Request Removed", toastOptions);
    } catch (err) {
      toast.error(err.message, {
        ...toastOptions,
        onClose: () => {
          removeClearError();
        },
      });
    }
  };

  const declineRequest = async (friendId) => {
    try {
      const responseData = await rejectSendRequest(
        declineFriendRequestRoute,
        "POST",
        JSON.stringify({
          friendID: friendId,
        }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      setFriendRequests((prev) =>
        prev.filter((friend) => friend.uid !== responseData.friend)
      );
      toast.success("Request Rejected", toastOptions);
    } catch (err) {
      toast.error(err.message, {
        ...toastOptions,
        onClose: () => {
          rejectClearError();
        },
      });
    }
  };

  return (
    <>
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
          <Typography sx={{ flexGrow: "1" }}>My Friends</Typography>
          <Tooltip title="Add Friend">
            <IconButton onClick={() => setAddFriendDialogOpen(true)}>
              <GroupAdd sx={{ flexGrow: "1", cursor: "pointer" }} />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent sx={{ marginTop: 1 }}>
          {getFriendRIsLoading ||
          getRFriendsIsLoading ||
          getFriendsIsLoading ? (
            <Typography>Loading...</Typography>
          ) : (
            <>
              <Divider
                textAlign="left"
                sx={{
                  "::after,::before": { borderTop: "solid rgba(0,0,0,0.5)" },
                }}
              >
                <Typography fontFamily="cursive" fontWeight="800">
                  Friend Requests
                </Typography>
              </Divider>
              {friendRequests.length > 0 ? (
                <>
                  <List>
                    {friendRequests.map((frequest, index) => (
                      <ListItem
                        sx={{ marginTop: 2, marginBottom: 2 }}
                        key={index}
                      >
                        <ListItemAvatar>
                          <Avatar
                            alt={frequest.username}
                            src={`data:image/png;base64,${frequest.avatar}`}
                            sx={{ bgcolor: "#A6E3E9" }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={frequest.username}
                          secondary={frequest.name}
                        />
                        <Chip
                          icon={<Add />}
                          label="Accept"
                          variant="outlined"
                          sx={{ marginLeft: 2 }}
                          onClick={() => {
                            acceptRequest(frequest.uid);
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            declineRequest(frequest.uid);
                          }}
                        >
                          <HighlightOff />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Typography marginTop={3} marginBottom={3}>
                  No friend requests
                </Typography>
              )}

              <Divider
                textAlign="left"
                sx={{
                  "::after,::before": { borderTop: "solid rgba(0,0,0,0.5)" },
                }}
              >
                <Typography fontFamily="cursive" fontWeight="800">
                  My Friends
                </Typography>
              </Divider>
              {friends.length > 0 || requestedFriends.length > 0 ? (
                <>
                  <List>
                    {requestedFriends.map((friend, index) => (
                      <ListItem
                        sx={{ marginTop: 2, marginBottom: 2 }}
                        key={index}
                      >
                        <ListItemAvatar>
                          <Avatar
                            alt={friend.username}
                            src={`data:image/png;base64,${friend.avatar}`}
                            sx={{ bgcolor: "#A6E3E9" }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={friend.username}
                          secondary={friend.name}
                        />
                        <Chip
                          label="Requested"
                          variant="outlined"
                          sx={{ marginLeft: 2 }}
                          onClick={() => {
                            removeRequest(friend.uid);
                          }}
                        />
                      </ListItem>
                    ))}
                    {friends.map((friend, index) => (
                      <ListItem
                        sx={{ marginTop: 2, marginBottom: 2 }}
                        key={index}
                      >
                        <ListItemAvatar>
                          <Avatar
                            alt={friend.username}
                            src={`data:image/png;base64,${friend.avatar}`}
                            sx={{ bgcolor: "#A6E3E9" }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={friend.username}
                          secondary={friend.name}
                        />
                        <Chip
                          icon={<RemoveCircleOutline />}
                          label="Remove"
                          variant="outlined"
                          sx={{ marginLeft: 2 }}
                          onClick={() => {
                            setRmFriend(friend);
                            setRemoveFriendDialogOpen(true);
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Typography marginTop={3} marginBottom={3}>
                  No Friends Found
                </Typography>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      {removeFriendDialogOpen && (
        <ConfirmDialog
          title="Remove Friend"
          desc="Are you Sure to Remove?"
          open={removeFriendDialogOpen}
          handleClose={() => setRemoveFriendDialogOpen(false)}
          onConfirm={() => {
            unFriend();
            setRemoveFriendDialogOpen(false);
          }}
        />
      )}
      {addFriendDialogOpen && (
        <AddFriend
          open={addFriendDialogOpen}
          allFriends={[...friends, ...friendRequests, ...requestedFriends]}
          handleClose={() => setAddFriendDialogOpen(false)}
          addToRequested={(friend) =>
            setRequestedFriends((prev) => [...prev, friend])
          }
        />
      )}
    </>
  );
}

export default MyFriendsDialog;
