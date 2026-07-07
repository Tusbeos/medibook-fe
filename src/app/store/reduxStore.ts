import { logger } from "redux-logger";

import { configureStore } from "@reduxjs/toolkit";
import { createStateSyncMiddleware } from 'redux-state-sync';
import { persistStore } from 'redux-persist';

import rootReducer from "store/reducers/rootReducer";
import { publicApi } from "store/api/publicApi";
import { processLogout } from "store/slices/userSlice";

const environment = import.meta.env.MODE || "development";
let isDevelopment = environment === "development";

isDevelopment = false;

const reduxStateSyncConfig = {
  whitelist: [processLogout.type],
};

const middleware: any[] = [createStateSyncMiddleware(reduxStateSyncConfig)];
if (isDevelopment) middleware.push(logger);

const reduxStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(publicApi.middleware, ...middleware),
  devTools: isDevelopment,
});

export const dispatch = reduxStore.dispatch;
export type AppDispatch = typeof reduxStore.dispatch;
export type RootState = ReturnType<typeof reduxStore.getState>;

export const persistor = persistStore(reduxStore);

export default reduxStore;
