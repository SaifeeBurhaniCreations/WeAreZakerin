import { configureStore } from '@reduxjs/toolkit';
import fabReducer from "./slices/FabSlice";

export const store = configureStore({
  reducer: {
    fab: fabReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;