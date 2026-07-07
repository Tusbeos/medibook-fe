import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { IUser, IUserState } from "types";
import tokenManager from "utils/tokenManager";

const initialState: IUserState = {
  isLoggedIn: false,
  userInfo: null,
  token: null,
};

interface LoginPayload {
  userInfo: IUser;
  token?: string | null;
}

const clearSession = (state: IUserState) => {
  tokenManager.clearToken();
  state.isLoggedIn = false;
  state.userInfo = null;
  state.token = null;
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUserSuccess: () => {},
    userLoginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      const refreshToken =
        action.payload.userInfo?.refreshToken ||
        state.userInfo?.refreshToken ||
        tokenManager.getRefreshToken();

      tokenManager.setToken(action.payload.token || null, refreshToken || null);
      state.isLoggedIn = true;
      state.userInfo = action.payload.userInfo;
      state.token = action.payload.token || null;
    },
    userLoginFail: (state) => {
      clearSession(state);
    },
    processLogout: (state) => {
      clearSession(state);
    },
  },
});

export const {
  addUserSuccess,
  userLoginSuccess: userLoginSuccessAction,
  userLoginFail,
  processLogout,
} = userSlice.actions;

export default userSlice.reducer;
