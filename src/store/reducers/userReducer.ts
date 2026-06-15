import actionTypes from "../actions/actionTypes";
import { IUserState } from "../../types";
import tokenManager from "../../utils/tokenManager";

const initialState: IUserState = {
  isLoggedIn: false,
  userInfo: null,
  token: null,
};

const appReducer = (
  state: IUserState = initialState,
  action: any,
): IUserState => {
  switch (action.type) {
    case actionTypes.USER_LOGIN_SUCCESS:
      {
        const refreshToken =
          action.userInfo?.refreshToken ||
          state.userInfo?.refreshToken ||
          tokenManager.getRefreshToken();
        tokenManager.setToken(action.token || null, refreshToken || null);
      }
      return {
        ...state,
        isLoggedIn: true,
        userInfo: action.userInfo,
        token: action.token || null,
      };
    case actionTypes.USER_LOGIN_FAIL:
      tokenManager.clearToken();
      return {
        ...state,
        isLoggedIn: false,
        userInfo: null,
        token: null,
      };
    case actionTypes.PROCESS_LOGOUT:
      tokenManager.clearToken();
      return {
        ...state,
        isLoggedIn: false,
        userInfo: null,
        token: null,
      };
    default:
      return state;
  }
};

export default appReducer;
