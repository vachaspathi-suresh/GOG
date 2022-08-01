import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth";
import userSlice from "./user";
import requestSlice from "./requests";

const store = configureStore({
  reducer: { auth: authSlice, user: userSlice, requests: requestSlice },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
