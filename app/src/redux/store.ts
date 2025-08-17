import { configureStore } from '@reduxjs/toolkit';
import fabReducer from "./slices/FabSlice";
import modalReducer from "./slices/AddPartySlice";
import adminModalReducer from "./slices/AddAdminSlice";
import UserReducer from "./slices/UserSlice";
import OccassionReducer from "./slices/OccassionSlice";

export const store = configureStore({
  reducer: {
    fab: fabReducer,
    party: modalReducer,
    adminModal: adminModalReducer,
    users: UserReducer,
    occassions: OccassionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;