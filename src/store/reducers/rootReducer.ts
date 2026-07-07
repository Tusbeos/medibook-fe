import { combineReducers } from "redux";
import appReducer from "store/slices/appSlice";
import userReducer from "store/slices/userSlice";
import adminReducer from "store/slices/adminSlice";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { publicApi } from "store/api/publicApi";

const persistCommonConfig = {
  storage: storage,
  stateReconciler: autoMergeLevel2,
};
const userPersistConfig = {
  ...persistCommonConfig,
  key: "user",
  whitelist: ["isLoggedIn", "userInfo", "token"],
};

const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  app: appReducer,
  admin: adminReducer,
  [publicApi.reducerPath]: publicApi.reducer,
});

export default rootReducer;
