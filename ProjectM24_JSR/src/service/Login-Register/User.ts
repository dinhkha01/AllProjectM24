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
  export const pushInfor : any= createAsyncThunk("user/infor",async({name,dob,address,phone}:{name:string;dob:string;address:string;phone:string})=>{
    const idUser= localStorage.getItem("userId")
    const res= await api.patch("users/"+ idUser,{name, dob, address, phone})
    return res.data
  });




  export const updateFriendsApi = async (userId: number, friends: any[]) => {
    const res = await api.patch(`users/${userId}`, { friends });
    return res.data;
  };




  export const updateFriends: any = createAsyncThunk(
    "user/updateFriends",
    async (newFriends: any[], { getState }) => {
  
        const state: any = getState();

        const userId = state.users.currentUser.id;

        const response = await updateFriendsApi(userId, newFriends);

        return response;
      
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
        
        // Remove notification from current user's notyfi array
        const updatedCurrentUserNotyfi = currentUser.notyfi.filter(
          (n: any) => n.userId !== friendId
        );
        
        // Cập nhật cho cả hai người dùng
        const currentUserResponse = await api.patch(`users/${currentUserId}`, {
          friends: updatedCurrentUserFriends,
          notyfi: updatedCurrentUserNotyfi
        });
        const friendResponse = await api.patch(`users/${friendId}`, {
          friends: updatedFriendFriends,
        });
  
        return {
          updatedCurrentUser: currentUserResponse.data,
          updatedFriend: friendResponse.data
        };
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

        // Remove friend request from current user's friends list
        const updatedCurrentUserFriends = currentUser.friends.filter(
          (f: any) => f.userId !== friendId
        );

        // Remove friend request from friend's friends list
        const updatedFriendFriends = friend.friends.filter(
          (f: any) => f.userId !== currentUserId
        );

        // Remove notification from current user's notyfi array
        const updatedCurrentUserNotyfi = currentUser.notyfi.filter(
          (n: any) => n.userId !== friendId
        );

        // Update both users
        await api.patch(`users/${currentUserId}`, {
          friends: updatedCurrentUserFriends,
          notyfi: updatedCurrentUserNotyfi
        });
        const response = await api.patch(`users/${friendId}`, {
          friends: updatedFriendFriends,
        });

        return {
          updatedUser: response.data,
          currentUser: {
            ...currentUser,
            friends: updatedCurrentUserFriends,
            notyfi: updatedCurrentUserNotyfi
          }
        };
      } catch (error: any) {
        return rejectWithValue(error.response.data);
      }
    }
  );
/////////////////
export const banOrUnban: any = createAsyncThunk("auth/banOrUnban",async({userId,status}:{userId:number,status:boolean})=>{
  // console.log(use);
  
    const res = await api.patch("users/"+userId,{status})
    return res.data
})
////////////
export const deleteUser :any = createAsyncThunk("user/deleteUser",async (userId:number)=>{
  const res = await api.delete("users/"+userId)
  return res.data
})

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
            dob:action.payload.dob,
            address:action.payload.address,
            status:action.payload.status,
            date:action.payload.date,

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
          const { updatedCurrentUser, updatedFriend } = action.payload;
          
          // Cập nhật currentUser
          if (state.currentUser && state.currentUser.id === updatedCurrentUser.id) {
            state.currentUser = updatedCurrentUser;
          }
          
          // Cập nhật users array
          const currentUserIndex = state.users.findIndex(
            (user) => user.id === updatedCurrentUser.id
          );
          if (currentUserIndex !== -1) {
            state.users[currentUserIndex] = updatedCurrentUser;
          }
          
          const friendIndex = state.users.findIndex(
            (user) => user.id === updatedFriend.id
          );
          if (friendIndex !== -1) {
            state.users[friendIndex] = updatedFriend;
          }
        })
        .addCase(rejectFriendRequest.fulfilled, (state, action) => {
          const { updatedUser, currentUser } = action.payload;
          const index = state.users.findIndex(
            (user) => user.id === updatedUser.id
          );
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
          if (state.currentUser && state.currentUser.id === currentUser.id) {
            state.currentUser = currentUser;
          }
        }). addCase(pushInfor.fulfilled,(state,action)=>{
          if(state.currentUser){
             state.currentUser.name = action.payload.name;
             state.currentUser.dob = action.payload.dob;
             state.currentUser.address = action.payload.address;
             state.currentUser.phone = action.payload.phone;
          }
       
        }).addCase (banOrUnban.fulfilled,(state,action)=>{
          if(state.currentUser ){
            state.currentUser.status= action.payload.status
          }
      
         
        }). addCase (deleteUser.fulfilled,(state,action)=>{
          state.users= state.users.filter(users=>users.id!==action.payload)
        })
    },
  });

  export const reducer = authSlice.reducer;
