import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface EventItem {
    type: string;
    name: string;
    party: string;
    rating: number;
}

export interface PartyItem {
    name: string;
    count: number;
}

export interface Occassion {
    _id?: string; // MongoDB ID
    createdat: Date;
    updatedat: Date;
    location: string;
    start_at: Date;
    time: Date;
    ends_at: Date;
    name: string;
    status: string;
    created_by: string;
    events: EventItem[];
    parties: PartyItem[];
}

interface OccassionState {
    occassions: Occassion[];
}

const initialState: Occassion[] = []

const OccassionSlice = createSlice({
    name: "occassion",
    initialState,
    reducers: {
        // Set full list (e.g., after fetchAll)
        setOccassions: (state, action: PayloadAction<Occassion[]>) => {
            state = action.payload;
        },

        // Add new occasion to state (e.g., after create API success)
        addOccassion: (state, action: PayloadAction<Occassion>) => {
            state.push(action.payload);
        },

        // Update occasion by id (e.g., after update API success)
        updateOccassion: (state, action: PayloadAction<Occassion>) => {
            state = state.map((occ) =>
                occ._id === action.payload._id ? action.payload : occ
            );
        },

        // Remove occasion by id (e.g., after delete API success)
        removeOccassion: (state, action: PayloadAction<string>) => {
            state = state.filter((occ) => occ._id !== action.payload);
        },

        // Set grouped results if needed
        setOccassionGroups: (state, action: PayloadAction<any[]>) => {
            // You can store grouped data differently if needed
            state = action.payload as any;
        }
    }
});

export const {
    setOccassions,
    addOccassion,
    updateOccassion,
    removeOccassion,
    setOccassionGroups
} = OccassionSlice.actions;

export default OccassionSlice.reducer;
