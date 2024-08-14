export interface users {
  id: number;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: boolean;
  avatar: string;
  banner: string;
  dob:string;
  date:string;
  address:string
  friends: FriendType[];
  notyfi: notyfiType[];
  status: boolean
}

export type FriendType = {
  userId: number;
  status: "pending" | "accept" 
  add_at: string;
};
export type notyfiType = {

  userId: number;
  content: string;
  add_at: string;
  status:boolean;
};
/////////////////////////////////////////////////
export interface post {
  content: string;
  status:boolean;
  img: string[];
  reactions: [];
  userId: number;
  date: string;
  id: number;
  privacy: 'public' | 'private';
  comments: Comment[]
  like:like[]
}
export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  date: string;
  reactions: any[];
}
export interface like{
  userId:number;
}



////////////////////////////////////////////
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
  groupName: string;
  dateAt:string;
  avatar: string;
  coverimg: string;
  status:boolean
  members: GroupMember[];
  postGroup: GroupPost[];
}
