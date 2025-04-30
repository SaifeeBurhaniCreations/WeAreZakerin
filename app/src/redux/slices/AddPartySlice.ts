import { createSlice } from "@reduxjs/toolkit";

const AddPartySlice = createSlice({
  name: "add party",
  initialState: { isModalOpen: false },
  reducers: {
    toggleModal: (state, action) => {
      state.isModalOpen = action.payload;
    },
  },
});

export const { toggleModal } = AddPartySlice.actions;
export default AddPartySlice.reducer;
