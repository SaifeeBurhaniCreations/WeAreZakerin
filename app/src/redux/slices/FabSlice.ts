import { createSlice } from "@reduxjs/toolkit";

const fabSlice = createSlice({
  name: "fab",
  initialState: { isOpen: false },
  reducers: {
    toggleFab: (state, action) => {
      state.isOpen = action.payload;
    },
  },
});

export const { toggleFab } = fabSlice.actions;
export default fabSlice.reducer;
