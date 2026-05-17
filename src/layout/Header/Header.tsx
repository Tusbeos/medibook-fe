import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

import * as actions from "store/actions";
import Navigator from 'components/Navigator';
import { adminMenu, clinicManagerMenu, doctorMenu } from "./menuApp";
import { LANGUAGES, USER_ROLE } from "utils";
import { changeLanguageApp } from "store/actions/appActions";
import "./Header.scss";
import { FormattedMessage } from "react-intl";
import _ from "lodash";
import { IRootState, IMenuGroup } from "types";
import { getBase64FromBuffer } from "utils/CommonUtils";
import { userLoginSuccess } from "store/actions/userActions";
import { useGetUserByIdQuery } from "store/api/publicApi";

// Header chuyển sang Function Component + Hooks
const Header: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const token = useSelector((state: IRootState) => state.user.token);
  const userId = userInfo?.id || userInfo?.userId;
  const { data: profileResponse } = useGetUserByIdQuery(userId || "", {
    skip: !isLoggedIn || !userId,
  });
  const handleGetUserById = useCallback(
    async (_userId: number | string) => profileResponse || { errCode: -1 },
    [profileResponse],
  );

  const [menuApp, setMenuApp] = useState<IMenuGroup[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [fetchedProfileUserId, setFetchedProfileUserId] = useState<
    number | string | null
  >(null);

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
      if (role === USER_ROLE.CLINIC_MANAGER) {
        menu = clinicManagerMenu;
      }
    }
    setMenuApp(menu);

    let title = "";
    for (const group of menu) {
      if (group.menus) {
        for (const item of group.menus) {
          if (location.pathname.startsWith(item.link)) {
            title = item.name;
            break;
          }
        }
      }
      if (title) break;
    }
    setPageTitle(title);
  }, [userInfo, location.pathname]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [userInfo?.image]);

  useEffect(() => {
    const userId = userInfo?.id || userInfo?.userId;
    if (!isLoggedIn || !userId || !profileResponse || fetchedProfileUserId === userId) return;

    const fetchProfile = async () => {
      try {
        const res = await handleGetUserById(userId);
        if (res?.data && res.errCode === 0) {
          dispatch(
            userLoginSuccess(
              {
                ...userInfo,
                ...res.data,
                token: (userInfo as any)?.token,
                refreshToken: (userInfo as any)?.refreshToken,
              },
              token || undefined,
            ),
          );
        }
      } catch (e) {
        // Header vẫn render fallback avatar nếu không lấy được profile.
      } finally {
        setFetchedProfileUserId(userId);
      }
    };

    fetchProfile();
  }, [dispatch, fetchedProfileUserId, handleGetUserById, isLoggedIn, profileResponse, token, userInfo]);

  const handleChangeLanguage = useCallback((lang: string) => {
    dispatch(changeLanguageApp(lang));
  }, [dispatch]);

  const processLogout = useCallback(() => {
    dispatch(actions.processLogout());
  }, [dispatch]);

  const getRoleLabel = useCallback(() => {
    const roleId = userInfo?.roleId || (userInfo as any)?.roleData?.keyMap;
    switch (roleId) {
      case USER_ROLE.ADMIN:
        return "Admin";
      case USER_ROLE.DOCTOR:
        return "Bác sĩ";
      case USER_ROLE.CLINIC_MANAGER:
        return "Quản lý phòng khám";
      case USER_ROLE.PATIENT:
        return "Bệnh nhân";
      default:
        return "Người dùng";
    }
  }, [userInfo]);

  const getAvatarSrc = useCallback(() => {
    const image = userInfo?.image;
    if (!image || avatarLoadError) return "";
    return getBase64FromBuffer(image);
  }, [userInfo, avatarLoadError]);

  return (
    <div className="header-topbar">
      <div className="page-title">
        {pageTitle ? <FormattedMessage id={pageTitle} /> : null}
      </div>

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
            <span className="user-role">{getRoleLabel()}</span>
          </div>
          <div className="user-avatar">
            {getAvatarSrc() ? (
              <img
                src={getAvatarSrc()}
                alt="avatar"
                onError={() => setAvatarLoadError(true)}
              />
            ) : (
              <i className="fas fa-user-circle"></i>
            )}
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
