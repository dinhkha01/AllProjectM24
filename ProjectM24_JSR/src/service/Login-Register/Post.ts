import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "..";
import { like, post } from "../../config/interface";

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
export const addCommentToPost: any = createAsyncThunk(
  'post/addComment',
  async ({ postId, comment }: { postId: number, comment: Comment }) => {
    const response = await api.get(`post/${postId}`);
    const post = response.data;
    const updatedComments = [...post.comments, comment];
    const updatedResponse = await api.patch(`post/${postId}`, { 
      comments: updatedComments
    });
    return { postId, updatedPost: updatedResponse.data };
  }
);
export const likePost: any = createAsyncThunk(
  'post/likePost',
  async ({ postId, userId }: { postId: number, userId: number }) => {
    const response = await api.get(`post/${postId}`);
    const post = response.data;
    const likeIndex = post.like.findIndex((like: like) => like.userId === userId);
    
    if (likeIndex === -1) {
      // User hasn't liked the post, so add the like
      post.like.push({ userId });
    } else {
      // User has already liked the post, so remove the like
      post.like.splice(likeIndex, 1);
    }
    
    const updatedResponse = await api.patch(`post/${postId}`, { like: post.like });
    return { postId, updatedPost: updatedResponse.data };
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
      }) .addCase(switchStatus.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const postIndex = state.post.findIndex(p => p.id === updatedPost.id);
        if (postIndex !== -1) {
          state.post[postIndex] = updatedPost;
        }
      }) .addCase(addCommentToPost.fulfilled, (state, action) => {
        const { postId, updatedPost } = action.payload;
        const postIndex = state.post.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          state.post[postIndex] = updatedPost;
        }
      }).addCase(likePost.fulfilled, (state, action) => {
        const { postId, updatedPost } = action.payload;
        const postIndex = state.post.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          state.post[postIndex] = updatedPost;
        }
      });
  },
});

export const { reducer } = postSlice;
