import { configureStore } from '@reduxjs/toolkit';
import fabReducer from "./slices/FabSlice";
import modalReducer from "./slices/AddPartySlice";
import adminModalReducer from "./slices/AddAdminSlice";
import UserReducer from "./slices/UserSlice";

export const store = configureStore({
  reducer: {
    fab: fabReducer,
    modal: modalReducer,
    adminModal: adminModalReducer,
    users: UserReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;