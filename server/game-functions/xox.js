const roomNumber = require("../utils/RoomNumberGenerator");

const xox = (socket, io) => {
  socket.on("xox-cr-room", (totalP) => {
    if (!!totalP) {
      const roomNo = roomNumber();
      const uData = sidUsers.get(socket.id);
      rooms.set(roomNo, {
        tp: totalP,
        np: 1,
        p: [{ sid: socket.id, pn: 1, h: false, ud: uData }],
      });
      socket.join(roomNo);
      sidRooms.set(socket.id, roomNo);
      socket.emit("xox-rm-cr", { roomNo, pn: 1, ud: uData });
    }
  });
  socket.on("xox-jr-room", (roomNo) => {
    if (rooms.has(roomNo)) {
      const rdata = rooms.get(roomNo);
      if (!!rdata) {
        if (rdata.np === rdata.tp) {
          socket.emit("xox-rm-jr", { pn: "FULL" });
        } else {
          const uData = sidUsers.get(socket.id);
          const pM = rooms.get(roomNo).p[0].ud;
          rooms.set(roomNo, {
            tp: rdata.tp,
            np: rdata.np + 1,
            p: [
              ...rdata.p,
              { sid: socket.id, pn: rdata.np + 1, h: false, ud: uData },
            ],
          });
          socket.join(roomNo);
          sidRooms.set(socket.id, roomNo);
          socket.emit("xox-rm-jr", { roomNo, pn: rdata.np + 1, ud: uData, pM });
          socket.to(roomNo).emit("xox-p-j", { pn: rdata.np + 1, ud: uData });
        }
      }
    } else {
      socket.emit("xox-rm-jr", { pn: "INVALID" });
    }
  });
  socket.on("xox-p-in", ({ roomNo, pn, pos }) => {
    if (rooms.has(roomNo)) {
      socket.to(roomNo).emit("xox-p-ou", { pos, pn });
    }
  });
  socket.on("xox-g-o", (roomNo) => {
    if (rooms.has(roomNo)) {
      const rdata = rooms.get(roomNo);
      if (!!rdata && !!rdata.p) {
        rooms.set(roomNo, {
          ...rdata,
          p: [
            { ...rdata.p[0], h: true },
            { ...rdata.p[1], h: true },
          ],
        });
      }
    }
  });
  socket.on("xox-g-r", (roomNo) => {
    if (rooms.has(roomNo)) {
      const rdata = rooms.get(roomNo);
      if (!!rdata && !!rdata.p) {
        if (rdata.np === 1) {
          rooms.set(roomNo, {
            ...rdata,
            p: [{ ...rdata.p[0], pn: 1, h: false }],
          });
          const uData = sidUsers.get(socket.id);
          io.to(roomNo).emit("xox-g-rr", { pn: 1, ud: uData });
        } else {
          if (rdata.p[0].h && rdata.p[1].h) {
            if (rdata.p[0].sid === socket.id) {
              rooms.set(roomNo, {
                ...rdata,
                p: [rdata.p[1], { ...rdata.p[0], pn: 1, h: false }],
              });
            } else {
              rooms.set(roomNo, {
                ...rdata,
                p: [rdata.p[0], { ...rdata.p[1], pn: 1, h: false }],
              });
            }
            const uData = sidUsers.get(socket.id);
            io.to(socket.id).emit("xox-g-rr", { pn: 1, ud: uData });
          } else {
            if (rdata.p[0].sid === socket.id) {
              rooms.set(roomNo, {
                ...rdata,
                p: [rdata.p[1], { ...rdata.p[0], pn: 2, h: false }],
              });
            } else {
              rooms.set(roomNo, {
                ...rdata,
                p: [rdata.p[0], { ...rdata.p[1], pn: 2, h: false }],
              });
            }
            const pM = rooms.get(roomNo).p[0].ud;
            const uData = sidUsers.get(socket.id);
            io.to(socket.id).emit("xox-g-rr", { pn: 2, ud: uData, pM });
            socket.to(roomNo).emit("xox-p-j", { pn: 2, ud: uData });
          }
        }
      }
    }
  });
  socket.on("xox-g-e", (roomNo) => {
    socket.leave(roomNo);
    sidRooms.delete(socket.id);
    if (rooms.has(roomNo)) {
      const rd = rooms.get(roomNo);
      if (!!rd) {
        let lpn;
        const rm = rd.p.filter((m) => {
          if (m.sid === socket.id) lpn = m;
          return m.sid !== socket.id;
        });
        if (rm.length === 0) rooms.delete(roomNo);
        else {
          if (!!lpn) {
            rooms.set(roomNo, { tp: rd.tp, np: rd.np - 1, p: [...rm] });
            if (!lpn.h) io.to(roomNo).emit("p-left", { pn: lpn.pn });
          }
        }
      }
    }
  });
};

module.exports = xox;
