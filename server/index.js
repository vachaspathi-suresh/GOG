require("dotenv").config();

const userRoutes = require("./routes/user-routes");
const friendRoutes = require("./routes/friend-routes");
const HttpError = require("./models/http-error");
const xox = require("./game-functions/xox");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const socket = require("socket.io");
const { v4: uuid4 } = require("uuid");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", userRoutes);
app.use("/api/friend", friendRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(process.env.DB_URL, { useNewUrlParser: true })
  .then(() => {
    try {
      const server = app.listen(process.env.PORT || 5000, () => {
        console.log("Server is up and listening");
      });
      const io = socket(server, {
        cors: {
          origin: process.env.CLIENT_ORIGIN,
          credentials: true,
        },
      });

      global.onlineUsers = new Map();
      global.sidUsers = new Map();
      global.rooms = new Map();
      global.sidRooms = new Map();
      global.ss = io;
      io.on("connection", (socket) => {
        socket.on("user-add", (userData) => {
          if (!!userData) {
            onlineUsers.set(userData.uid, socket.id);
            sidUsers.set(socket.id, userData);
          }
        });
        socket.on("user-invite", (data) => {
          if (!!data) {
            const toUser = onlineUsers.get(data.uid);
            if (toUser) {
              if (data.game === "xox")
                socket.to(toUser).emit("user-invite-rec", {
                  id: uuid4(),
                  game: "Tic Tac Toe",
                  from: data.from,
                  roomNo: data.roomNo,
                });
              socket.emit("user-invite-res", {
                status: true,
                avatar: data.avatar,
                uname: data.to,
                id: data.uid,
              });
            } else {
              socket.emit("user-invite-res", { status: false });
            }
          }
        });
        xox(socket, io);
        socket.on("disconnect", () => {
          const r = sidRooms.get(socket.id);
          if (r) {
            const rd = rooms.get(r);
            if (!!rd) {
              let lpn;
              const rm = rd.p.filter((m) => {
                if (m.sid === socket.id) lpn = m;
                return m.sid !== socket.id;
              });
              if (!!rm && rm.length === 0) rooms.delete(r);
              else {
                if (!!lpn) {
                  rooms.set(r, { tp: rd.tp, np: rd.np - 1, p: [...rm] });
                  if (!lpn.h) io.to(r).emit("p-left", { pn: lpn.pn });
                }
              }
            }
          }
          const dId = sidUsers.get(socket.id);
          if (dId) {
            onlineUsers.delete(dId);
            sidUsers.delete(socket.id);
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  })
  .catch((err) => {
    console.log("ERROR_CONNECTING_DATABASE", err);
  });
