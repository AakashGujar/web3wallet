import { configureStore } from '@reduxjs/toolkit';
import chainReducer from './chainSlice';

export const store = configureStore({
  reducer: {
    chain: chainReducer,
  },
});
