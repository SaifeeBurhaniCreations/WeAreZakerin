import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    me: {}
}

const UserSlice = createSlice({
    name: "UserSlice",
    initialState,
    reducers: {
        handleFetchUser: (state, action) => {
            state.users = Array.isArray(action.payload) ? action.payload : [];
        },
        handleFetchMe: (state, action) => {
            state.me = action.payload ? action.payload : {};
        },
        handleAddUser: (state, action) => {
            state.users.push(action.payload);
        },
        handleRemoveUser: (state, action) => {
            state.users = state.users?.filter(user => user.userid !== action.payload)
        }
    },
});

export const { handleAddUser, handleFetchUser, handleFetchMe, handleRemoveUser } =
    UserSlice.actions;
export default UserSlice.reducer;
