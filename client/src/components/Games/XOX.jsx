import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Container,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { AccountCircle, ArrowBack } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import GameInitializer from "../UI/GameInitializer";
import Nav from "../UI/Nav";
import WinDialog from "../UI/WinDialog";
import ConfirmDialog from "../UI/ConfirmDialog";

let board = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
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
function XOX() {
  const [searchParams, setSearchParams] = useSearchParams();
  const wid = window.innerHeight > window.innerWidth ? "vw" : "vh";
  const socket = useSelector((state) => state.user.socket);
  const myUname = useSelector((state) => state.user.username);
  const [roomNo, setRoomNo] = useState(null);
  const [currPlayer, setCurrPlayer] = useState(1);
  const [playerCount, setPlayerCount] = useState({ 1: 0, 0: 0 });
  const [myNum, setMyNum] = useState(null);
  const [pNames, setPNames] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [isStart, setIsStart] = useState(0);
  const [gameStatus, setGameStatus] = useState(null);
  const [isCreate, setIsCreate] = useState(0);
  const [backDialogOpen, setBackDialogOpen] = useState(false);
  useEffect(() => {
    let isWin = -1;
    let i = 0;
    while (i < 3 && isWin === -1) {
      if (
        board[i][0] === board[i][1] &&
        board[i][1] === board[i][2] &&
        board[i][0] !== 0
      )
        isWin = board[i][0];
      i++;
    }
    i = 0;
    while (i < 3 && isWin === -1) {
      if (
        board[0][i] === board[1][i] &&
        board[1][i] === board[2][i] &&
        board[0][i] !== 0
      )
        isWin = board[0][i];
      i++;
    }
    if (
      isWin === -1 &&
      board[1][1] !== 0 &&
      ((board[0][0] === board[1][1] && board[1][1] === board[2][2]) ||
        (board[0][2] === board[1][1] && board[1][1] === board[2][0]))
    )
      isWin = board[1][1];
    if (isWin !== -1) {
      socket.emit("xox-g-o", roomNo);
      if (isWin === myNum) {
        setGameStatus("You Won!!");
      } else {
        setGameStatus("You Lost!!");
      }
      setIsStart(2);
    } else if (playerCount[0] + playerCount[1] === 9) {
      board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      setPlayerCount({ 1: 0, 0: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myNum, playerCount]);

  useEffect(() => {
    if (socket) {
      socket.on("xox-rm-cr", (data) => {
        setRoomNo(data.roomNo);
        setMyNum(data.pn);
        if (data.ud)
          setPNames([{ uname: data.ud.uname, avatar: data.ud.avatar }]);
        else setPNames([{ uname: "Player" + data.pn, avatar: null }]);
      });

      socket.on("xox-rm-jr", (data) => {
        if (data.pn === "FULL") {
          toast.error("ROOM IS FULL!!", toastOptions);
          setIsCreate(2);
        } else if (data.pn === "INVALID") {
          toast.error("INVALID ROOM!!", toastOptions);
          setIsCreate(2);
        } else {
          setRoomNo(data.roomNo);
          setMyNum(data.pn);
          if (data.pM)
            setPNames([{ uname: data.pM.uname, avatar: data.pM.avatar }]);
          else setPNames([{ uname: "Player 1", avatar: null }]);
          if (data.ud)
            setPNames((prev) => [
              ...prev,
              { uname: data.ud.uname, avatar: data.ud.avatar },
            ]);
          else
            setPNames((prev) => [
              ...prev,
              { uname: "Player" + data.pn, avatar: null },
            ]);
        }
      });

      socket.on("xox-p-j", (data) => {
        if (data.ud)
          setPNames((prev) => [
            ...prev,
            { uname: data.ud.uname, avatar: data.ud.avatar },
          ]);
        else
          setPNames((prev) => [
            ...prev,
            { uname: "Player" + data.pn, avatar: null },
          ]);
      });

      socket.on("xox-p-ou", (data) => {
        board[data.pos.x][data.pos.y] = data.pn;
        setPlayerCount((prev) => ({
          ...prev,
          [currPlayer]: prev[currPlayer] + 1,
        }));
        setCurrPlayer((prev) => (prev + 1) % 2);
      });

      socket.on("xox-g-rr", (data) => {
        setMyNum(data.pn);
        if (data.pn === 2) {
          if (data.pM)
            setPNames([{ uname: data.pM.uname, avatar: data.pM.avatar }]);
          else setPNames([{ uname: "Player 1", avatar: null }]);
          if (data.ud)
            setPNames((prev) => [
              ...prev,
              { uname: data.ud.uname, avatar: data.ud.avatar },
            ]);
          else
            setPNames((prev) => [
              ...prev,
              { uname: "Player" + data.pn, avatar: null },
            ]);
        } else {
          if (data.ud)
            setPNames([{ uname: data.ud.uname, avatar: data.ud.avatar }]);
          else setPNames([{ uname: "Player" + data.pn, avatar: null }]);
        }
      });

      socket.on("user-invite-res", (data) => {
        if (data.status) {
          setSentInvites((prev) => [
            ...prev,
            { avatar: data.avatar, uname: data.uname, uid: data.id },
          ]);
          toast.success("Invite Sent!!", toastOptions);
        } else {
          toast("User went OFFLINE!!", toastOptions);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    return () => {
      if (roomNo) {
        exitGame();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomNo]);

  useEffect(() => {
    if (socket && pNames.length === 2)
      socket.on("p-left", (data) => {
        setGameStatus(
          "You Won!!," + pNames[data.pn - 1].uname + " Left the Game."
        );
        setIsStart(2);
      });
  }, [pNames, socket]);

  useEffect(() => {
    if (pNames.length === 2) {
      setIsStart(1);
      setSentInvites([]);
    }
  }, [pNames]);

  useEffect(() => {
    if (searchParams.has("room")) {
      setIsCreate(2);
      joinRoom(searchParams.get("room"));
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const createRoom = () => {
    setSentInvites([]);
    socket.emit("xox-cr-room", 2);
  };

  const joinRoom = (rn) => {
    setSentInvites([]);
    socket.emit("xox-jr-room", rn);
  };

  const sendXOXInvite = (friend) => {
    let isSent = false;
    sentInvites.forEach((invite) => {
      if (invite.uid === friend.uid) {
        isSent = true;
      }
    });
    if (!isSent) {
      socket.emit("user-invite", {
        game: "xox",
        to: friend.username,
        from: myUname,
        roomNo,
        uid: friend.uid,
        avatar: friend.avatar,
      });
    } else {
      toast.error("Already a invite!!", toastOptions);
    }
  };

  const tabClick = (position) => {
    board[position.x][position.y] = currPlayer === 0 ? 2 : 1;
    setPlayerCount((prev) => ({
      ...prev,
      [currPlayer]: prev[currPlayer] + 1,
    }));
    setCurrPlayer((prev) => (prev + 1) % 2);
    socket.emit("xox-p-in", {
      roomNo,
      pn: myNum,
      pos: { ...position },
    });
  };

  const exitGame = () => {
    board = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    setIsStart(0);
    setIsCreate(0);
    socket.emit("xox-g-e", roomNo);
    setCurrPlayer(1);
    setMyNum(null);
    setPNames([]);
    setPlayerCount({ 1: 0, 0: 0 });
    setRoomNo(null);
    setBackDialogOpen(false);
  };

  const restartGame = () => {
    board = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    setPNames([]);
    socket.emit("xox-g-r", roomNo);
    setIsStart(0);
    setIsCreate(1);
    setCurrPlayer(1);
    setPlayerCount({ 1: 0, 0: 0 });
  };

  return (
    <>
      <Nav />
      {isStart !== 0 ? (
        <>
          <IconButton
            sx={{ marginLeft: "1rem" }}
            onClick={() => {
              setBackDialogOpen(true);
            }}
          >
            <ArrowBack sx={{ fontSize: "2rem" }} />
          </IconButton>
          <Container
            component="main"
            sx={{
              m: "0",
              padding: 2,
              paddingTop: 0,
            }}
          >
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              {board.map((row, i) => (
                <Grid
                  item
                  alignItems="center"
                  display="flex"
                  flexDirection="column"
                  alignContent="center"
                  key={i}
                >
                  {row.map((cell, j) => {
                    if (cell === 0) {
                      return (
                        <Box
                          alignItems="center"
                          display="flex"
                          flexDirection="column"
                          alignContent="center"
                          width={"20" + wid}
                          height={"20" + wid}
                          bgcolor="#77A4A8"
                          margin={"1" + wid}
                          sx={{
                            cursor:
                              myNum % 2 === currPlayer &&
                              isStart === 1 &&
                              "pointer",
                          }}
                          onClick={() => {
                            if (myNum % 2 === currPlayer && isStart === 1) {
                              tabClick({ x: i, y: j });
                            }
                          }}
                          key={i * 10 + j * 2}
                        />
                      );
                    } else if (cell === 1) {
                      return (
                        <Box
                          alignItems="center"
                          display="flex"
                          flexDirection="column"
                          alignContent="center"
                          width={"20" + wid}
                          height={"20" + wid}
                          bgcolor="#77A4A8"
                          margin={"1" + wid}
                          key={i * 10 + j * 2}
                        >
                          <Typography
                            gutterBottom
                            fontFamily="cursive"
                            color="#6E4275"
                            fontWeight="800"
                            fontSize={"13" + wid}
                          >
                            X
                          </Typography>
                        </Box>
                      );
                    } else {
                      return (
                        <Box
                          alignItems="center"
                          display="flex"
                          flexDirection="column"
                          alignContent="center"
                          width={"20" + wid}
                          height={"20" + wid}
                          bgcolor="#77A4A8"
                          margin={"1" + wid}
                          key={i * 10 + j * 2}
                        >
                          <Typography
                            gutterBottom
                            fontFamily="cursive"
                            color="#755C59"
                            fontWeight="800"
                            fontSize={"13" + wid}
                          >
                            O
                          </Typography>
                        </Box>
                      );
                    }
                  })}
                </Grid>
              ))}
              <Grid item>
                <Box
                  alignItems="center"
                  display="flex"
                  flexDirection="column"
                  alignContent="center"
                  padding={1 === currPlayer ? "2vw" : "1.8vw"}
                  border={1 === currPlayer ? 4 : 1}
                  marginTop={"1vw"}
                  bgcolor="#B66DC2"
                  borderColor={1 === currPlayer ? "#3B2E2D" : "black"}
                >
                  <Typography
                    fontWeight={1 === currPlayer ? 800 : 600}
                    fontSize={1 === currPlayer ? "3vw" : "2.5vw"}
                  >
                    X
                  </Typography>
                  <Grid
                    container
                    spacing={1}
                    direction="row"
                    justifyContent="center"
                    alignContent="center"
                    alignItems="center"
                  >
                    <Grid item>
                      {!!pNames[0].avatar ? (
                        <Avatar
                          alt={pNames[0].uname}
                          src={`data:image/png;base64,${pNames[0].avatar}`}
                        />
                      ) : (
                        <AccountCircle />
                      )}
                    </Grid>
                    <Grid item>
                      <Typography
                        fontFamily="cursive"
                        fontSize={1 === currPlayer ? "2.5vw" : "2vw"}
                      >
                        {pNames[0].uname}
                      </Typography>
                    </Grid>
                  </Grid>
                  {myNum === 1 && 1 === currPlayer && (
                    <Typography>You</Typography>
                  )}
                </Box>
                <Box
                  alignItems="center"
                  display="flex"
                  flexDirection="column"
                  alignContent="center"
                  padding={0 === currPlayer ? "2vw" : "1.8vw"}
                  border={0 === currPlayer ? 4 : 1}
                  marginTop={"1vw"}
                  bgcolor="#BA928D"
                  borderColor={0 === currPlayer ? "#3B2E2D" : "black"}
                >
                  <Typography
                    fontWeight={0 === currPlayer ? 800 : 600}
                    fontSize={0 === currPlayer ? "3vw" : "2.5vw"}
                  >
                    O
                  </Typography>
                  <Grid
                    container
                    spacing={1}
                    direction="row"
                    justifyContent="center"
                    alignContent="center"
                    alignItems="center"
                  >
                    <Grid item>
                      {!!pNames[1].avatar ? (
                        <Avatar
                          alt={pNames[1].uname}
                          src={`data:image/png;base64,${pNames[1].avatar}`}
                        />
                      ) : (
                        <AccountCircle />
                      )}
                    </Grid>
                    <Grid item>
                      <Typography
                        fontFamily="cursive"
                        fontSize={0 === currPlayer ? "2.5vw" : "2vw"}
                      >
                        {pNames[1].uname}
                      </Typography>
                    </Grid>
                  </Grid>
                  {myNum === 2 && 0 === currPlayer && (
                    <Typography>You</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
            {isStart === 2 && (
              <WinDialog
                title="Game Over"
                desc={gameStatus}
                open={isStart === 2}
                handleClose={() => setIsStart(3)}
                onExit={exitGame}
                onRestart={restartGame}
              />
            )}
            {backDialogOpen && (
              <ConfirmDialog
                title="Exit Game?"
                desc="Are you sure to Exit? All your current state will be lost!!"
                open={backDialogOpen}
                handleClose={() => setBackDialogOpen(false)}
                onConfirm={exitGame}
              />
            )}
          </Container>
        </>
      ) : (
        <GameInitializer
          title="Tic Tac Toe"
          roomCreateFun={createRoom}
          roomJoinFun={joinRoom}
          roomNo={roomNo}
          playersNames={pNames}
          tp={2}
          setStart={setIsStart}
          leaveRoom={exitGame}
          isCreate={isCreate}
          setIsCreate={setIsCreate}
          sendInvite={sendXOXInvite}
          sentInvites={sentInvites}
        />
      )}
    </>
  );
}

export default XOX;
