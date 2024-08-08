import { configureStore } from "@reduxjs/toolkit";
import { reducer as reducerUser } from "../service/Login-Register/User";
import { reducer as reducerPost } from "../service/Login-Register/Post";
import { reducer as reducerGroup } from "../service/Login-Register/Group";

export const store = configureStore({
  reducer: {
    users: reducerUser,
    post: reducerPost,
    group: reducerGroup,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
