import { IUser } from '../../types';
import {
  addUserSuccess,
  processLogout,
  userLoginFail,
  userLoginSuccessAction,
} from "store/slices/userSlice";

export const userLoginSuccess = (userInfo: IUser, token?: string) => ({
  type: userLoginSuccessAction.type,
  payload: {
    userInfo,
    token: token || null,
  },
});

export { addUserSuccess, processLogout, userLoginFail };
