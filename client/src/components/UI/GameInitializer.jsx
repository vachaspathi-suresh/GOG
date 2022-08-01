import React, { useState } from "react";
import {
  Avatar,
  Button,
  Container,
  Divider,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { AddCircle } from "@mui/icons-material";

import OnlineFriendsDialog from "../AccountSettings/OnlineFriendsDialog";

function GameInitializer({
  title,
  roomCreateFun,
  roomJoinFun,
  roomNo,
  playersNames,
  leaveRoom,
  isCreate,
  setIsCreate,
  sendInvite,
  sentInvites,
}) {
  const isLogged = useSelector((state) => state.auth.isLoggedIn);
  const [isOnlineDialogOpen, setIsOnlineDialogOpen] = useState(false);
  const [roomNoField, setRoomNoField] = useState(0);

  return (
    <>
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item>
            <Typography
              variant="h3"
              component="h1"
              fontFamily="cursive"
              fontWeight="800"
              color="#427578"
              sx={{ margin: 5 }}
            >
              {title}
            </Typography>
          </Grid>
          <Grid item>
            {isCreate === 1 && isLogged && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setIsOnlineDialogOpen(true)}
              >
                <AddCircle />
                Invite
              </Button>
            )}
          </Grid>
        </Grid>
        {isCreate === 0 && (
          <>
            <Button
              variant="contained"
              sx={{ width: "50%", margin: 3 }}
              onClick={() => {
                roomCreateFun();
                setIsCreate(1);
              }}
            >
              Create Room
            </Button>
            <Button
              variant="contained"
              sx={{ width: "50%", margin: 3 }}
              onClick={() => setIsCreate(2)}
            >
              Join Room
            </Button>
          </>
        )}
        {isCreate === 1 && (
          <>
            <Typography variant="h5">
              ROOM CODE:
              {
                <span style={{ backgroundColor: "#A6E3E9", fontSize: "4vw" }}>
                  {roomNo}
                </span>
              }
            </Typography>
            <Typography>
              {" "}
              Waiting for other player to join the room...
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                leaveRoom();
                setIsCreate(0);
              }}
              sx={{ margin: 3 }}
            >
              Leave Room
            </Button>
            <Link
              color="#427578"
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setIsCreate(0);
              }}
            >
              Go Back
            </Link>
          </>
        )}
        {isCreate === 2 && (
          <>
            <TextField
              variant="standard"
              color="secondary"
              label="Enter ROOM CODE"
              type="text"
              onChange={(event) => {
                setRoomNoField(event.target.value);
              }}
            />
            <Button
              disabled={!(roomNoField.length > 6)}
              variant="contained"
              size="large"
              sx={{ margin: 3 }}
              onClick={() => {
                roomJoinFun(roomNoField);
                setIsCreate(1);
              }}
            >
              Enter Room
            </Button>
            <Link
              color="#427578"
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setIsCreate(0);
              }}
            >
              Go Back
            </Link>
          </>
        )}
      </Container>
      {isLogged && isCreate === 1 && sentInvites.length > 0 && (
        <>
          <Divider textAlign="center" sx={{ marginTop: 3, marginBottom: 2 }}>
            <Typography fontFamily="cursive" fontWeight="800">
              Invites
            </Typography>
          </Divider>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1.5}
          >
            {sentInvites.map((invite) => (
              <Grid item key={invite.uid}>
                <Avatar
                  alt={invite.uname}
                  src={`data:image/png;base64,${invite.avatar}`}
                  sx={{
                    bgcolor: "#A6E3E9",
                    width: "10vw",
                    height: "10vw",
                  }}
                />
                <Typography>{invite.uname}</Typography>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      {isOnlineDialogOpen && (
        <OnlineFriendsDialog
          open={isOnlineDialogOpen}
          handleClose={() => setIsOnlineDialogOpen(false)}
          sendInvite={sendInvite}
        />
      )}
    </>
  );
}

export default GameInitializer;
