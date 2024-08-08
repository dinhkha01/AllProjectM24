export interface users {
  id: number;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: boolean;
  avatar: string;
  banner: string;
  friends: FriendType[];
  notyfi: notyfiType[];
}
export type FriendType = {
  userId: number;
  status: "pending" | "accept" | "blocked";
  add_at: string;
};
export type notyfiType = {
  userId: number;
  content: string;
  date: string;
};
export interface post {
  content: string;
  img: string[];
  reactions: [];
  userId: number;
  date: string;
  id: number;
  privacy: 'public' | 'private';
}
export interface GroupMember {
  userId: number;
  role:boolean;
  dateJoin: string;
}

export interface GroupPost {
  idPostGroup:number;
  userId: number;
  content: string;
  img: string[];
  dateat: string;
}

export interface Group {
  id: number;
  userId:number;
  groupName: string;
  avatar: string;
  coverimg: string;
  members: GroupMember[];
  postGroup: GroupPost[];
}
