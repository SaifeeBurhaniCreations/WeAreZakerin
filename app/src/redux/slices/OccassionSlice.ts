import { Event, RootStackParamList } from "@/src/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface PartyItem {
    name: string;
    count: number;
}
export interface HijriDate {
    month: number;
    day: number;
    year: number;
}

export interface Occassion {
    _id?: string; // MongoDB ID
    id?: string; // MongoDB ID
    createdat: Date;
    updatedat: Date;
    location: string;
    start_at: Date;
    time: Date;
    ends_at: Date;
    name: string;
    description: string;
    status: string;
    pressable?: boolean;
    created_by: string;
    hijri_date: HijriDate;
    events: Event[];
    attendees: string[];
    parties: PartyItem[];
    onPress?: keyof RootStackParamList
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
            return action.payload;
        },

        // Add new occasion to state (e.g., after create API success)
        addOccassion: (state, action: PayloadAction<Occassion>) => {
            state.push(action.payload);
        },

        updateOccassion: (state, action: PayloadAction<Occassion>) => {
            console.log(action.payload);
            console.log(state);
            const index = state.findIndex(occ => occ._id === action.payload._id);
            if (index !== -1) {
                state[index] = action.payload;
            }
        },
        
        // Remove occasion by id (e.g., after delete API success)
        removeOccassion: (state, action: PayloadAction<string>) => {
            state = state.filter((occ) => occ._id !== action.payload);
        },

        // Set grouped results if needed
        setOccassionGroups: (state, action: PayloadAction<any[]>) => {
            // You can store grouped data differently if needed
            state = action.payload as any;
        },

        clearOccassions: (state) => {
            return []
        }
    }
});

export const {
    setOccassions,
    addOccassion,
    updateOccassion,
    removeOccassion,
    setOccassionGroups,
    clearOccassions
} = OccassionSlice.actions;

export default OccassionSlice.reducer;
