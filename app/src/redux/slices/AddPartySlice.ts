import { createSlice } from "@reduxjs/toolkit";

interface Group {
  name: string;
  members: string[];
  _id: string;
  id: string;
  admin: string;
}

interface AddPartyState {
  isModalOpen: boolean;
  groups: Group[];
}

const initialState: AddPartyState = {
  isModalOpen: false,
  groups: []
}

const AddPartySlice = createSlice({
  name: "add party",
  initialState,
  reducers: {
    toggleModal: (state, action) => {
      state.isModalOpen = action.payload;
    },
    handleFetchGroup: (state, action) => {
      // Ensure payload is an array of Group type
      state.groups = action.payload;
    },
    handleAddGroup: (state, action) => {
      // Ensure payload is a Group type
      state.groups.push(action.payload);
    },
    handleUpdateGroup: (state, action) => {
      // Ensure payload is a Group type
      const index = state.groups.findIndex(
        (group) => group.id === action.payload.id
      );
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
    },
    handleDeleteGroup: (state, action) => {
      // Ensure payload is a string (the ID to delete)
      state.groups = state.groups.filter((group) => group.id !== action.payload);
    },
    handleAddMemberInGroup: (state, action) => {
      const { name, id } = action.payload; // `id` here is likely the user object with an `_id` property

      const groupToUpdate = state.groups.find((group) => group.name === name);

      if (groupToUpdate) {
        // Ensure 'members' is an array. If it's not an array, reinitialize it.
        if (!Array.isArray(groupToUpdate.members)) {
          groupToUpdate.members = [];
        }

        // Push the user's ID. Assuming 'id' in action.payload is the user object.
        groupToUpdate.members.push(id?._id);
      }
    },
  },
});

export const { toggleModal, handleFetchGroup, handleAddGroup, handleUpdateGroup, handleDeleteGroup, handleAddMemberInGroup } =
  AddPartySlice.actions;
export default AddPartySlice.reducer;
