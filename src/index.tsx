import React from 'react';
import { createRoot } from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import './styles/styles.scss';

import App from './containers/App';
import IntlProviderWrapper from "./hoc/IntlProviderWrapper";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { Provider } from 'react-redux';
import reduxStore, { persistor } from './reduxStore';
import tokenManager from './utils/tokenManager';
import { processLogout } from './store/actions';

const renderApp = () => {
    // Đăng ký logout handler cho tokenManager (Axios sẽ gọi khi nhận 401)
    tokenManager.setLogoutHandler(() => {
      reduxStore.dispatch(processLogout());
    });

    // Khôi phục token từ Redux persisted state (sau khi refresh trang)
    const state = reduxStore.getState() as any;
    const persistedToken = state?.user?.token;
    if (persistedToken) {
      tokenManager.setToken(persistedToken);
    }

    const container = document.getElementById('root');
    const root = createRoot(container!);
    root.render(
        <Provider store={reduxStore}>
            <IntlProviderWrapper>
                <App persistor={persistor}/>
            </IntlProviderWrapper>
        </Provider>
    );
};

renderApp();
