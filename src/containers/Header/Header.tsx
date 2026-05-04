import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as actions from "../../store/actions";
import Navigator from '../../components/Navigator';
import { adminMenu, doctorMenu } from "./menuApp";
import { LANGUAGES, USER_ROLE } from "../../utils";
import { changeLanguageApp } from "../../store/actions/appActions";
import "./Header.scss";
import { FormattedMessage } from "react-intl";
import _ from "lodash";
import { IRootState, IMenuGroup } from "../../types";

// Header chuyển sang Function Component + Hooks
const Header: React.FC = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  const [menuApp, setMenuApp] = useState<IMenuGroup[]>([]);

  useEffect(() => {
    let menu: IMenuGroup[] = [];
    if (userInfo && !_.isEmpty(userInfo)) {
      let role = userInfo.roleId;
      if (role === USER_ROLE.ADMIN) {
        menu = adminMenu;
      }
      if (role === USER_ROLE.DOCTOR) {
        menu = doctorMenu;
      }
    }
    setMenuApp(menu);
  }, [userInfo]);

  const handleChangeLanguage = useCallback((lang: string) => {
    dispatch(changeLanguageApp(lang));
  }, [dispatch]);

  const processLogout = useCallback(() => {
    dispatch(actions.processLogout());
  }, [dispatch]);

  return (
    <div className="header-topbar">
      <div className="search-container">
        <i className="fas fa-search search-icon"></i>
        <input type="text" placeholder="Search doctors, ID, or clinic..." />
      </div>

      <div className="topbar-right">
        <div className="icon-action">
          <i className="far fa-bell"></i>
          <span className="badge"></span>
        </div>
        <div className="icon-action">
          <i className="fas fa-cog"></i>
        </div>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">
              {userInfo && userInfo.lastName ? `${userInfo.lastName} ${userInfo.firstName}` : "Admin Profile"}
            </span>
            <span className="user-role">Super Administrator</span>
          </div>
          <div className="user-avatar">
            <img src="https://i.pravatar.cc/150?img=11" alt="avatar" />
          </div>
        </div>

        <div className="languages">
          <span
            className={language === LANGUAGES.VI ? "language-vi active" : "language-vi"}
            onClick={() => handleChangeLanguage(LANGUAGES.VI)}
          >
            VN
          </span>
          <span
            className={language === LANGUAGES.EN ? "language-en active" : "language-en"}
            onClick={() => handleChangeLanguage(LANGUAGES.EN)}
          >
            EN
          </span>
          <div
            className="btn btn-logout"
            onClick={processLogout}
            title="Log out"
          >
            <i className="fas fa-sign-out-alt"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
