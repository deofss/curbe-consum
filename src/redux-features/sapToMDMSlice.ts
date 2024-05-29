//@ts-nocheck
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface SapToMDMState {
  array: any;
}

const initialState: SapToMDMState = {
  array: [["Loc consum", "Fisier", "Anomalie detectata"]],
};

export const sapToMDMSlice = createSlice({
  name: "sapToMDM",
  initialState,
  reducers: {
    addValues: (state: any, action: PayloadAction<any[]>) => {
      state.array.push(...action.payload);
    },
    addSingleValue: (state: any, action: PayloadAction<any>) => {
      state.array.push(action.payload);
    },
    reset: (state: any) => {
      state = [["Loc consum", "Fisier", "Anomalie detectata"]];
    },
  },
});

export const { addValues, reset, addSingleValue } = sapToMDMSlice.actions;

export const selectSapToMDM = (state: RootState) => state.sapToMDM.array;

export default sapToMDMSlice.reducer;
