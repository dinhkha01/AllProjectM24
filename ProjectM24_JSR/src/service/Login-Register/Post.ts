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
export const deletePost: any = createAsyncThunk(
  "post/deletePost",
  async (postId: number, { rejectWithValue }) => {
    try {
      await api.delete(`post/${postId}`);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const updatePostPrivacy: any = createAsyncThunk(
  "post/updatePostPrivacy",
  async ({ postId, privacy }: { postId: number; privacy: "public" | "private" }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`post/${postId}`, { privacy });
      return { postId, privacy: response.data.privacy };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
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
      }).addCase(deletePost.fulfilled, (state, action) => {
        state.post = state.post.filter((p) => p.id !== action.payload);
      })
      .addCase(updatePostPrivacy.fulfilled, (state, action) => {
        const { postId, privacy } = action.payload;
        const postIndex = state.post.findIndex((p) => p.id === postId);
        if (postIndex !== -1) {
          state.post[postIndex].privacy = privacy;
        }
      });;
  },
});

export const { reducer } = postSlice;
