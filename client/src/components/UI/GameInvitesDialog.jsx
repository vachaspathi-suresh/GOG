import React from "react";
import {
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { HighlightOff, ThumbUpAlt } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { createSearchParams, useNavigate } from "react-router-dom";

import { requestsAction } from "../../store/requests";

function GameInvitesDialog({ open, handleClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const grequests = useSelector((state) => state.requests.gameRequests);

  const removeInvite = (iID) => {
    dispatch(requestsAction.delGameRequest(iID));
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
          <Typography sx={{ flexGrow: "1" }}>Game Invites</Typography>
        </DialogTitle>
        <DialogContent sx={{ marginTop: 1 }}>
          {grequests.length > 0 ? (
            <>
              <List>
                {grequests.map((req) => (
                  <ListItem sx={{ marginTop: 2, marginBottom: 2 }} key={req.id}>
                    <ListItemText
                      primary={req.game}
                      secondary={"from: " + req.from}
                    />
                    <Chip
                      icon={<ThumbUpAlt />}
                      label="Join"
                      variant="outlined"
                      sx={{ marginLeft: 2 }}
                      onClick={() => {
                        navigate({
                          pathname: "/game/tic-tac-toe",
                          search: `?${createSearchParams({
                            room: req.roomNo,
                          })}`,
                        });
                        removeInvite(req.id);
                        handleClose();
                      }}
                    />
                    <IconButton
                      onClick={() => {
                        removeInvite(req.id);
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
              No Invites
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GameInvitesDialog;
