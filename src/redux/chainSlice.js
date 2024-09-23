import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedChain: null,
};

const chainSlice = createSlice({
  name: 'chain',
  initialState,
  reducers: {
    setChain: (state, action) => {
      state.selectedChain = action.payload; 
    },
    resetChain: (state) => {
      state.selectedChain = null;
    },
  },
});

export const { setChain, resetChain } = chainSlice.actions;
export default chainSlice.reducer;
