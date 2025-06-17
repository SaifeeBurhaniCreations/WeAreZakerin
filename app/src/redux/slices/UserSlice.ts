import { RootStackParamList } from "@/src/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ImageSourcePropType } from "react-native";
export type User = {
    id: string;
    _id: string;
    userid: string;
    userpass: string;
    fullname: string;
    phone: string;
    email: string;
    title: string;
    grade: string;
    address: string;
    belongsto: string;
    role: 'member' | 'groupAdmin' | 'superadmin';
    attendence: any[];
    createdat: string;
    updatedat: string;
    profileImage: {
      s3Url: string;
      s3Key: string;
    };
    image: ImageSourcePropType;
    tag: boolean;
    admin: string,
    me: string,
    pressable?: boolean,
    onPress?: keyof RootStackParamList,
  };
  type UserState = {
    users: User[];
    me: Partial<User>; 
  };  
  
  const initialState: UserState = {
    users: [],
    me: {},
  };
  
  const UserSlice = createSlice({
    name: 'UserSlice',
    initialState,
    reducers: {
      handleFetchUser: (state, action: PayloadAction<User[]>) => {
        state.users = action.payload || [];
      },
      handleFetchMe: (state, action: PayloadAction<User>) => {
        state.me = action.payload || {};
      },
      handleAddUser: (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
      },
      handleRemoveUser: (state, action: PayloadAction<string>) => {
        state.users = state.users.filter(user => user.userid !== action.payload);
      },
    },
  });
  
  export const {
    handleAddUser,
    handleFetchUser,
    handleFetchMe,
    handleRemoveUser,
  } = UserSlice.actions;
  
  export default UserSlice.reducer;
  