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
  async (postId: number) => {
      await api.delete(`post/${postId}`);
      return postId;
  
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
export const switchStatus:any= createAsyncThunk("post/switchStatus",async({postId,status}:{postId:number,status:boolean})=>{
  const res = await api.patch("post/"+postId,{status})
  return res.data
})
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
      }) .addCase(switchStatus.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const postIndex = state.post.findIndex(p => p.id === updatedPost.id);
        if (postIndex !== -1) {
          state.post[postIndex] = updatedPost;
        }
      });
  },
});

export const { reducer } = postSlice;
