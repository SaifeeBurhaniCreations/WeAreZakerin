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
    },
});

export const { handleAddUser, handleFetchUser, handleFetchMe } =
    UserSlice.actions;
export default UserSlice.reducer;
