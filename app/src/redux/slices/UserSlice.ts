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
    role: 'member' | 'groupadmin' | 'superadmin';
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
      handleUpdateUserRole: (state, action: PayloadAction<{ transferAdminId: string; admin: string }>) => {
        const { transferAdminId, admin } = action.payload;
        state.users = state.users?.map(user => {
          if (user._id === transferAdminId) {
            return { ...user, role: 'groupadmin' };
          }
          if (user._id === admin) {
            return { ...user, role: 'member' };
          }
          return user;
        });
      },
      handleAddUserInParty: (state, action: PayloadAction<{ user: string, name: string }>) => {
        const { user, name } = action.payload;
        state.users = state.users.map(value =>
          value._id === user ? { ...value, belongsto: name } : value
        );
      },
      handleRemoveUserFromParty: (state, action: PayloadAction<{ user: string }>) => {
        const { user } = action.payload;
        state.users = state.users.map(value =>
          value._id === user ? { ...value, belongsto: '' } : value
        );
      },
      clearUsers: (state) => {
        state.me = {}
        state.users = []
      }
    },
  });
  
  export const {
    handleAddUser,
    handleFetchUser,
    handleFetchMe,
    handleAddUserInParty,
    handleUpdateUserRole,
    handleRemoveUserFromParty,
    handleRemoveUser,
    clearUsers
  } = UserSlice.actions;
  
  export default UserSlice.reducer;
  