import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "..";
import { Group, GroupPost } from "../../config/interface";
import { RootState } from "../../store";

export const allGroups :any= createAsyncThunk("group/allGroups", async () => {
  const res = await api.get("group");
  return res.data;
});

export const getGroupById:any = createAsyncThunk(
  "group/getGroupById",
  async (groupId: number, { rejectWithValue }) => {
    try {
      const res = await api.get<Group>(`group/${groupId}`);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const pushAvatar : any= createAsyncThunk(
  "group/pushAvatar",
  async ({ groupId, avatar }: { groupId: number; avatar: string }, { rejectWithValue }) => {
    
    
    try {
      const response = await api.patch(`group/${groupId}`, { avatar });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const pushCoverImg:any = createAsyncThunk(
  "group/pushCoverImg",
  async ({ groupId, coverimg }: { groupId: number; coverimg: string }, { rejectWithValue }) => {

    try {
      const response = await api.patch(`group/${groupId}`, { coverimg });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const createGroupPost: any = createAsyncThunk(
  "group/createGroupPost",
  async ({ groupId, postData }: { groupId: number; postData: Omit<GroupPost, 'idPostGroup' | 'dateat'> }, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const group = state.group.groups.find(g => g.id === groupId);
      
      if (!group) {
        throw new Error("Group not found");
      }

      const newPost: GroupPost = {
        idPostGroup: Date.now(), // Tạo một ID duy nhất dựa trên thời gian hiện tại
        ...postData,
        dateat: new Date().toISOString() // Thêm thời gian hiện tại
      };

      const updatedPostGroup = [...(group.postGroup || []), newPost];

      // Sử dụng phương thức PATCH để cập nhật mảng postGroup
      const response = await api.patch(`group/${groupId}`, {
        postGroup: updatedPostGroup
      });

      // Trả về dữ liệu mới, giả định rằng server trả về group đã được cập nhật
      return { groupId, post: newPost, updatedGroup: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);
export const addUserInGroup: any = createAsyncThunk(
  "group/addUserInGroup",
  async ({ groupId, userId }: { groupId: number; userId: number, }, { getState }) => {

      const state: RootState = getState() as RootState;
      const group = state.group.groups.find(g => g.id === groupId);

      if (!group) {
        throw new Error("Group not found");
      }

      const newMember = {
        userId: userId,
        role: false,
        dateJoin: new Date().toISOString(),
      };

      const updatedMembers = [...(group.members ), newMember];

      const response = await api.patch(`group/${groupId}`, {
        members: updatedMembers,
      });

      return { groupId, member: newMember, updatedGroup: response.data };
  
  }
);
export const createGroup: any = createAsyncThunk(
  "group/createGroup",
  async (data: Group) => {
    const response = await api.post<Group>("group",data);
    return response.data;
  }
);
interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  currentGroup: null,
  isLoading: false,
  error: null,
};

export const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(allGroups.fulfilled, (state, action) => {

        state.groups = action.payload;

      })
      
      .addCase(getGroupById.fulfilled, (state, action) => {

        state.currentGroup = action.payload;
   
      })
     
      .addCase(pushAvatar.fulfilled, (state, action) => {
        if (state.currentGroup) {
          state.currentGroup.avatar = action.payload.avatar;
        }
      })
      .addCase(pushCoverImg.fulfilled, (state, action) => {
        if (state.currentGroup) {
          state.currentGroup.coverimg = action.payload.coverimg;
        }
      }).addCase(createGroupPost.fulfilled, (state, action: PayloadAction<{ groupId: number; post: GroupPost; updatedGroup: Group }>) => {
        const { groupId, post, updatedGroup } = action.payload;
        
        // Cập nhật group trong danh sách groups
        const groupIndex = state.groups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex] = updatedGroup;
        }
      
        // Cập nhật currentGroup nếu đang xem group này
        if (state.currentGroup && state.currentGroup.id === groupId) {
          state.currentGroup = updatedGroup;
        }
      }) .addCase(addUserInGroup.fulfilled, (state, action: PayloadAction<{ groupId: number; member: any; updatedGroup: Group }>) => {
        const { groupId, updatedGroup } = action.payload;
        const groupIndex = state.groups.findIndex(g => g.id === groupId);
  
        if (groupIndex !== -1) {
          state.groups[groupIndex] = updatedGroup;
        }
  
        if (state.currentGroup && state.currentGroup.id === groupId) {
          state.currentGroup = updatedGroup;
        }
      }). addCase(createGroup.fulfilled,(state,action)=>{
        state.groups=[...state.groups,action.payload]
      });
      
  },
});

export const { reducer } = groupSlice;