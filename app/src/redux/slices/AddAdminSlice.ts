import { createSlice } from "@reduxjs/toolkit";

const AddAdminSlice = createSlice({
  name: "add admin",
  initialState: { isAdminModalOpen: false },
  reducers: {
    toggleAdminModal: (state, action) => {
      state.isAdminModalOpen = action.payload;
    },
  },
});

export const { toggleAdminModal } = AddAdminSlice.actions;
export default AddAdminSlice.reducer;
