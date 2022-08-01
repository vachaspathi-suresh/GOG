const roomNumber = () => {
  const time = new Date().getTime().toString();
  const timeCut = time.slice(-4) + time.slice(5, 8);
  const roomNos = Array.from(rooms.keys());
  let roomID;
  for (let i = 65; i < 91; i++) {
    for (let j = 65; j < 91; j++) {
      roomID = String.fromCharCode(i) + String.fromCharCode(j) + timeCut;
      if (!!roomNos.find((no) => no === roomID)) {
        continue;
      }
      return roomID;
    }
  }
  return timeCut;
};

module.exports = roomNumber;
