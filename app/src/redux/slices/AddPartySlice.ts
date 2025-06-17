import { RootStackParamList } from "@/src/types";
import { createSlice } from "@reduxjs/toolkit";
import { ImageSourcePropType } from "react-native";

export interface Group {
  id: string;
  _id: string;
  image: ImageSourcePropType;
  name: string;
  members: string[];
  admin: string;
  tag: string;
  pressable?: boolean, 
    onPress?: keyof RootStackParamList;
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
    handleRemoveMemberFromGroup: (state, action) => {
      const { name, id } = action.payload; // 'id' can be a string (user id) or an object with _id
    
    const groupToUpdate = state.groups.find((group) => group.name === name);
    
    if (groupToUpdate) {
      const memberId = id;
      console.log(groupToUpdate.members.filter(
        (memberIdInGroup) => memberIdInGroup !== memberId
      ));
    
        // Filter out the member with the matching ID
        groupToUpdate.members = groupToUpdate.members.filter(
          (memberIdInGroup) => memberIdInGroup !== memberId
        );
      }
    }
    
  },
});

export const { toggleModal, handleFetchGroup, handleAddGroup, handleUpdateGroup, handleDeleteGroup, handleAddMemberInGroup, handleRemoveMemberFromGroup } =
  AddPartySlice.actions;
export default AddPartySlice.reducer;
