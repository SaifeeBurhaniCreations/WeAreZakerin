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
      const { name, user } = action.payload;
      const { _id, role } = user;

      const groupToUpdate = state.groups.find((group) => group.name === name);


      if (groupToUpdate) {
        // Ensure 'members' is an array
        if (!Array.isArray(groupToUpdate.members)) {
          groupToUpdate.members = [];
        }

        // Add user._id to members if not already included
        const alreadyMember = groupToUpdate.members.includes(_id);
        if (!alreadyMember) {
          groupToUpdate.members.push(_id);
        }

        // If user is not just a regular member, update admin
        if (role !== 'member') {
          groupToUpdate.admin = _id;
        }
      }
    },    
    handleRemoveMemberFromGroup: (state, action) => {
      const { name, id } = action.payload; // 'id' can be a string (user id) or an object with _id
    
    const groupToUpdate = state.groups.find((group) => group.name === name);
    
    if (groupToUpdate) {
      const memberId = id;
    
        // Filter out the member with the matching ID
        groupToUpdate.members = groupToUpdate.members.filter(
          (memberIdInGroup) => memberIdInGroup !== memberId
        );
      }
    },
    clearGroups: (state) => {
      state.groups = []
    }

  },
});

export const { toggleModal, clearGroups, handleFetchGroup, handleAddGroup, handleUpdateGroup, handleDeleteGroup, handleAddMemberInGroup, handleRemoveMemberFromGroup } =
  AddPartySlice.actions;
export default AddPartySlice.reducer;
