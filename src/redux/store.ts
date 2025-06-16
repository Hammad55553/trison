// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
// import other reducers here…

const store = configureStore({
  reducer: {
    auth: authReducer,
    // your other slices…
  },
});

// This infers the “shape” of your root state object
export type RootState = ReturnType<typeof store.getState>;
// This infers the dispatch type
export type AppDispatch = typeof store.dispatch;

export default store;
