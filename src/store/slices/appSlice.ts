import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { IAppState } from "types";

const initContentOfConfirmModal = {
  isOpen: false,
  messageId: "",
  handleFunc: null,
  dataFunc: null,
};

const initialState: IAppState = {
  started: true,
  language: "vi",
  systemMenuPath: "/system/user-manage",
  contentOfConfirmModal: {
    ...initContentOfConfirmModal,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    appStartUpComplete: (state) => {
      state.started = true;
    },
    setContentOfConfirmModal: (
      state,
      action: PayloadAction<Partial<IAppState["contentOfConfirmModal"]>>,
    ) => {
      state.contentOfConfirmModal = {
        ...state.contentOfConfirmModal,
        ...action.payload,
      };
    },
  },
});

export const { appStartUpComplete, setContentOfConfirmModal } =
  appSlice.actions;

export default appSlice.reducer;
