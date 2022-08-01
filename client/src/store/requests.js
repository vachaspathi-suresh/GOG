import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  friendRequests: 0,
  gameRequests: [],
};

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setFriendRequests(state, action) {
      state.friendRequests = action.payload;
    },
    setGameRequests(state, action) {
      state.gameRequests = action.payload;
    },
    addGameRequest(state, action) {
      state.gameRequests = [...state.gameRequests, action.payload];
      localStorage.setItem(
        "gog-game-requests",
        JSON.stringify({ requests: state.gameRequests })
      );
    },
    delGameRequest(state, action) {
      state.gameRequests = state.gameRequests.filter(
        (req) => req.id !== action.payload
      );
      localStorage.setItem(
        "gog-game-requests",
        JSON.stringify({ requests: state.gameRequests })
      );
    },
  },
});

export const requestsAction = requestSlice.actions;

export default requestSlice.reducer;
