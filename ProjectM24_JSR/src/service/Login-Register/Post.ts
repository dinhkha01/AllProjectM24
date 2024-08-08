import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "..";
import { post } from "../../config/interface";

export const getAllPost: any = createAsyncThunk("user/getAllPost", async () => {
  const res = await api.get("post");
  return res.data;
});
export const createPost: any = createAsyncThunk(
  "user/createPost",
  async (data: post) => {
    const res = await api.post("post", data);
    return res.data;
  }
);
export const postSlice = createSlice({
  name: "post",
  initialState: {
    post: [] as post[],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllPost.fulfilled, (state, action) => {
        state.post = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.post = [...state.post, action.payload];
      });
  },
});

export const { reducer } = postSlice;
