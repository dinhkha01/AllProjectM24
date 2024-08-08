import { Group } from "./../../config/interface/index";
import { getAllPost } from "./Post";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, auth } from "..";
import { users } from "../../config/interface";

// Auth API functions
export const registerApi = async (user: users) => {
  const res = await api.post("register", user);
  return res.data;
};

export const loginApi = async (data: { email: string; password: string }) => {
  const res = await api.post("login", data);
  return res.data;
};

// Async thunks
export const registerUser: any = createAsyncThunk(
  "user/register",
  async (data: users, { rejectWithValue }) => {
    try {
      const response = await registerApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const login: any = createAsyncThunk(
  "user/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await loginApi(credentials);
      localStorage.setItem("token", response.accessToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const getAllUsers: any = createAsyncThunk(
  "user/getAllUsers",
  async () => {
    const res = await api.get("users");
    return res.data;
  }
);

export const autoLogin: any = createAsyncThunk("user/autoLogin", async () => {
  const userId = localStorage.getItem("userId");
  const res = await auth.get("/660/users/" + userId);
  return res.data;
});
export const pushAvatar: any = createAsyncThunk(
  "user/avatar",
  async (avatar: string) => {
    const idUser = localStorage.getItem("userId");

    const res = await api.patch("users/" + idUser, { avatar });
    return res.data;
  }
);
export const pushBanner: any = createAsyncThunk(
  "user/banner",
  async (banner: string) => {
    const idUser = localStorage.getItem("userId");
    const res = await api.patch("users/" + idUser, { banner });
    return res.data;
  }
);
export const updateFriendsApi = async (userId: number, friends: any[]) => {
  const res = await api.patch(`users/${userId}`, { friends });
  return res.data;
};
export const updateFriends: any = createAsyncThunk(
  "user/updateFriends",
  async (newFriends: any[], { getState, rejectWithValue }) => {
    try {
      const state: any = getState();

      const userId = state.users.currentUser.id;

      const response = await updateFriendsApi(userId, newFriends);

      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateReceiverFriends: any = createAsyncThunk(
  "user/updateReceiverFriends",
  async (
    { userId, newFriends }: { userId: number; newFriends: any[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`users/${userId}`, {
        friends: newFriends,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateUserNotify: any = createAsyncThunk(
  "user/updateUserNotify",
  async (
    { userId, newNotify }: { userId: number; newNotify: any[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`users/${userId}`, {
        notyfi: newNotify,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const acceptFriendRequest: any = createAsyncThunk(
  "user/acceptFriendRequest",
  async (
    { currentUserId, friendId }: { currentUserId: number; friendId: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state: any = getState();
      const currentUser = state.users.users.find(
        (user: users) => user.id === currentUserId
      );
      const friend = state.users.users.find(
        (user: users) => user.id === friendId
      );

      if (!currentUser || !friend) {
        throw new Error("User not found");
      }

      // Cập nhật trạng thái bạn bè cho người dùng hiện tại
      const updatedCurrentUserFriends = currentUser.friends.map((f: any) =>
        f.userId === friendId ? { ...f, status: "accept" } : f
      );

      // Cập nhật trạng thái bạn bè cho người gửi lời mời
      const updatedFriendFriends = friend.friends.map((f: any) =>
        f.userId === currentUserId ? { ...f, status: "accept" } : f
      );

      // Cập nhật cho cả hai người dùng
      await api.patch(`users/${currentUserId}`, {
        friends: updatedCurrentUserFriends,
      });
      const response = await api.patch(`users/${friendId}`, {
        friends: updatedFriendFriends,
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rejectFriendRequest: any = createAsyncThunk(
  "user/rejectFriendRequest",
  async (
    { currentUserId, friendId }: { currentUserId: number; friendId: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state: any = getState();
      const currentUser = state.users.users.find(
        (user: users) => user.id === currentUserId
      );
      const friend = state.users.users.find(
        (user: users) => user.id === friendId
      );

      if (!currentUser || !friend) {
        throw new Error("User not found");
      }

      // Xóa thông tin kết bạn cho người dùng hiện tại
      const updatedCurrentUserFriends = currentUser.friends.filter(
        (f: any) => f.userId !== friendId
      );

      // Xóa thông tin kết bạn cho người gửi lời mời
      const updatedFriendFriends = friend.friends.filter(
        (f: any) => f.userId !== currentUserId
      );

      // Cập nhật cho cả hai người dùng
      await api.patch(`users/${currentUserId}`, {
        friends: updatedCurrentUserFriends,
      });
      const response = await api.patch(`users/${friendId}`, {
        friends: updatedFriendFriends,
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);



// Slice
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    users: [] as users[],
    isLoading: false,
    error: null as string | null,
    currentUser: {} as users | null,
    
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        localStorage.setItem("token", action.payload.accessToken);
      })
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        localStorage.setItem("token", action.payload.accessToken);
        localStorage.setItem("userId", action.payload.user.id);
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(autoLogin.fulfilled, (state, action) => {
        state.currentUser = {
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
          phone: action.payload.phone,
          role: action.payload.role,
          avatar: action.payload.avatar,
          password: "",
          banner: action.payload.banner,
          friends: action.payload.friends,
          notyfi: action.payload.notyfi,
        };
      })
      .addCase(pushAvatar.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser.avatar = action.payload.avatar;
        }
      })
      .addCase(pushBanner.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser.banner = action.payload.banner;
        }
      })
      .addCase(updateFriends.fulfilled, (state, action) => {
        if (state.currentUser) {
          console.log("action.payload", action.payload);

          state.currentUser.friends = action.payload.friends;
        }
      })
      .addCase(updateUserNotify.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      .addCase(updateReceiverFriends.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.currentUser && state.currentUser.id === updatedUser.id) {
          state.currentUser = updatedUser;
        }
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.currentUser && state.currentUser.id === updatedUser.id) {
          state.currentUser = updatedUser;
        }
      });
  },
});

export const reducer = authSlice.reducer;
