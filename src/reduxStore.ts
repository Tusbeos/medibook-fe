import { logger } from "redux-logger";
import thunkMiddleware from "redux-thunk";

import { createStore, applyMiddleware, compose } from 'redux';
import { createStateSyncMiddleware } from 'redux-state-sync';
import { persistStore } from 'redux-persist';

import rootReducer from './store/reducers/rootReducer';
import actionTypes from './store/actions/actionTypes';

const environment = import.meta.env.MODE || "development";
let isDevelopment = environment === "development";

isDevelopment = false;

const reduxStateSyncConfig = {
  whitelist: [actionTypes.APP_START_UP_COMPLETE, actionTypes.CHANGE_LANGUAGE],
};

const middleware: any[] = [
    thunkMiddleware,
    createStateSyncMiddleware(reduxStateSyncConfig),
]
if (isDevelopment) middleware.push(logger);

const composeEnhancers = (isDevelopment && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const reduxStore = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(...middleware)),
)

export const dispatch = reduxStore.dispatch;

export const persistor = persistStore(reduxStore);

export default reduxStore;