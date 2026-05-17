import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FormattedMessage } from "react-intl";
import HomeHeader from "../../HomePage/HomeHeader";
import { IRootState, IUser } from "../../../types";
import {
  handleEditUser,
  handleChangePassword,
} from "../../../services/userService";
import { userLoginSuccess } from "../../../store/actions/userActions";
import { LANGUAGES, normalizeImageSrc } from "../../../utils";
import "./PatientProfile.scss";
import {
  publicApi,
  useGetAllCodeQuery,
  useGetUserByIdQuery,
} from "../../../store/api/publicApi";
import { AppDispatch } from "../../../reduxStore";

const PatientProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const token = useSelector((state: IRootState) => state.user.token);
  const userId = userInfo?.id || userInfo?.userId;
  const { data: profileResponse } = useGetUserByIdQuery(userId || "", {
    skip: !userId,
  });
  const { data: gendersResponse } = useGetAllCodeQuery("GENDER");
  const profileUser = profileResponse?.errCode === 0 && profileResponse.data
    ? { ...userInfo, ...profileResponse.data }
    : userInfo;
  const genders =
    gendersResponse?.errCode === 0 && Array.isArray(gendersResponse.data)
      ? gendersResponse.data
      : [];
  const handleGetUserById = useCallback(
    async (_userId: number | string) => profileResponse || { errCode: -1 },
    [profileResponse],
  );
  const handleGetAllCode = useCallback(
    async (_type: string) => gendersResponse || { errCode: -1, data: [] },
    [gendersResponse],
  );
  const setGenders = useCallback((_data: any[]) => {}, []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // State cho phần đổi mật khẩu
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load thông tin user hiện tại vào form
  useEffect(() => {
    if (profileUser) {
      setFirstName(profileUser.firstName || "");
      setLastName(profileUser.lastName || "");
      setEmail(profileUser.email || "");
      setPhoneNumber(profileUser.phoneNumber || "");
      setAddress(profileUser.address || "");
      setGender(profileUser.gender || "");
      if (profileUser.image) {
        setPreviewAvatar(normalizeImageSrc(profileUser.image));
      }
    }
  }, [profileUser]);

  // Fetch dữ liệu mới nhất từ server khi vào trang (tránh Redux state cũ)
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = userInfo?.id || userInfo?.userId;
      if (!userId) return;
      try {
        const res = await handleGetUserById(userId);
        if (res && res.errCode === 0 && res.data) {
          const u = res.data;
          setFirstName(u.firstName || "");
          setLastName(u.lastName || "");
          setEmail(u.email || "");
          setPhoneNumber(u.phoneNumber || "");
          setAddress(u.address || "");
          setGender(u.gender || "");
          if (u.image) {
            setPreviewAvatar(normalizeImageSrc(u.image));
          }
        }
      } catch (e) {
        // Giữ nguyên dữ liệu Redux nếu lỗi mạng
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.id]);

  // Lấy danh sách giới tính
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const res = await handleGetAllCode("GENDER");
        if (res && res.errCode === 0) {
          setGenders(res.data || []);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchGenders();
  }, []);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreviewAvatar(base64);
        setAvatar(base64);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!userInfo?.id) return;

    const data: Partial<IUser> = {
      id: userInfo.id,
      firstName,
      lastName,
      phoneNumber,
      address,
      gender,
      roleId: userInfo.roleId || "R3",
      positionId: userInfo.positionId || "P0",
      avatar: avatar || undefined,
    };

    try {
      const res = await handleEditUser(data);
      if (res && res.errCode === 0) {
        toast.success(
          language === LANGUAGES.VI
            ? "Cập nhật thông tin thành công!"
            : "Profile updated successfully!",
        );
        // Fetch lại dữ liệu mới nhất từ server để cập nhật Redux store
        try {
          const fresh = await dispatch(
            publicApi.endpoints.getUserById.initiate(userInfo.id, {
              subscribe: false,
              forceRefetch: true,
            }),
          ).unwrap();
          if (fresh && fresh.errCode === 0 && fresh.data) {
            const updatedUser: IUser = {
              ...userInfo,
              ...fresh.data,
              image: normalizeImageSrc(fresh.data.image) || avatar || userInfo.image,
            };
            dispatch(userLoginSuccess(updatedUser, token || undefined));
          }
        } catch (_) {
          // Fallback: cập nhật Redux từ state form nếu không fetch được
          const updatedUser: IUser = {
            ...userInfo,
            firstName,
            lastName,
            phoneNumber,
            address,
            gender,
            image: avatar || userInfo.image,
          };
          dispatch(userLoginSuccess(updatedUser, token || undefined));
        }
        setAvatar("");
        setIsEditing(false);
      } else {
        toast.error(res?.errMessage || "Update failed");
      }
    } catch (err) {
      toast.error(
        language === LANGUAGES.VI
          ? "Có lỗi xảy ra khi cập nhật"
          : "Error updating profile",
      );
    }
  }, [
    userInfo,
    firstName,
    lastName,
    phoneNumber,
    address,
    gender,
    avatar,
    language,
    dispatch,
    token,
  ]);

  // Xử lý đổi mật khẩu
  const handleSavePassword = useCallback(async () => {
    const userId = userInfo?.id || userInfo?.userId;
    if (!userId) return;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error(
        language === LANGUAGES.VI
          ? "Vui lòng điền đầy đủ thông tin"
          : "Please fill in all fields",
      );
      return;
    }

    if (newPassword.length < 6) {
      toast.error(
        language === LANGUAGES.VI
          ? "Mật khẩu mới phải có ít nhất 6 ký tự"
          : "New password must be at least 6 characters",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        language === LANGUAGES.VI
          ? "Mật khẩu mới và xác nhận không khớp"
          : "New password and confirmation do not match",
      );
      return;
    }

    try {
      const res = await handleChangePassword(userId, {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      if (res && res.errCode === 0) {
        toast.success(
          language === LANGUAGES.VI
            ? "Đổi mật khẩu thành công!"
            : "Password changed successfully!",
        );
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowChangePassword(false);
      } else {
        toast.error(res?.errMessage || "Change password failed");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.errMessage ||
        err?.errMessage ||
        (language === LANGUAGES.VI
          ? "Có lỗi xảy ra khi đổi mật khẩu"
          : "Error changing password");
      toast.error(msg);
    }
  }, [userInfo, oldPassword, newPassword, confirmPassword, language]);

  const handleCancelPassword = useCallback(() => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePassword(false);
  }, []);

  const handleCancel = useCallback(() => {
    if (userInfo) {
      setFirstName(userInfo.firstName || "");
      setLastName(userInfo.lastName || "");
      setPhoneNumber(userInfo.phoneNumber || "");
      setAddress(userInfo.address || "");
      setGender(userInfo.gender || "");
      if (userInfo.image) {
        setPreviewAvatar(normalizeImageSrc(userInfo.image));
      }
      setAvatar("");
    }
    setIsEditing(false);
  }, [userInfo]);

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <div className="patient-profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h2>
              <FormattedMessage
                id="patient.profile.title"
                defaultMessage="Thông tin cá nhân"
              />
            </h2>
            {!isEditing && (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <i className="fas fa-pen" />
                <span>
                  <FormattedMessage
                    id="patient.profile.edit"
                    defaultMessage="Chỉnh sửa"
                  />
                </span>
              </button>
            )}
          </div>

          <div className="profile-body">
            {/* Avatar */}
            <div className="avatar-section">
              <div className="avatar-wrapper">
                {previewAvatar ? (
                  <img src={previewAvatar} alt="avatar" />
                ) : (
                  <i className="fas fa-user-circle default-avatar" />
                )}
                {isEditing && (
                  <label className="avatar-upload" htmlFor="avatar-input">
                    <i className="fas fa-camera" />
                    <input
                      type="file"
                      id="avatar-input"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      hidden
                    />
                  </label>
                )}
              </div>
              <span className="user-display-name">
                {`${lastName} ${firstName}`.trim() || email}
              </span>
            </div>

            {/* Form fields */}
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FormattedMessage
                    id="patient.profile.lastName"
                    defaultMessage="Họ"
                  />
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                ) : (
                  <span className="field-value">{lastName || "—"}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FormattedMessage
                    id="patient.profile.firstName"
                    defaultMessage="Tên"
                  />
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                ) : (
                  <span className="field-value">{firstName || "—"}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <span className="field-value readonly">{email || "—"}</span>
              </div>

              <div className="form-group">
                <label>
                  <FormattedMessage
                    id="patient.profile.phone"
                    defaultMessage="Số điện thoại"
                  />
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                ) : (
                  <span className="field-value">{phoneNumber || "—"}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label>
                  <FormattedMessage
                    id="patient.profile.address"
                    defaultMessage="Địa chỉ"
                  />
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                ) : (
                  <span className="field-value">{address || "—"}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FormattedMessage
                    id="patient.profile.gender"
                    defaultMessage="Giới tính"
                  />
                </label>
                {isEditing ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">--</option>
                    {genders.map((g: any) => (
                      <option key={g.keyMap} value={g.keyMap}>
                        {language === LANGUAGES.VI ? g.valueVi : g.valueEn}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="field-value">
                    {genders.find((g: any) => g.keyMap === gender)
                      ? language === LANGUAGES.VI
                        ? genders.find((g: any) => g.keyMap === gender)?.valueVi
                        : genders.find((g: any) => g.keyMap === gender)?.valueEn
                      : "—"}
                  </span>
                )}
              </div>
            </div>

            {/* Nút hành động */}
            {isEditing && (
              <div className="form-actions">
                <button className="btn-save" onClick={handleSave}>
                  <i className="fas fa-check" />
                  <span>
                    <FormattedMessage
                      id="patient.profile.save"
                      defaultMessage="Lưu thay đổi"
                    />
                  </span>
                </button>
                <button className="btn-cancel" onClick={handleCancel}>
                  <i className="fas fa-times" />
                  <span>
                    <FormattedMessage
                      id="patient.profile.cancel"
                      defaultMessage="Huỷ"
                    />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section đổi mật khẩu */}
        <div className="profile-card password-card">
          <div
            className="password-header"
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            <div className="password-header-left">
              <i className="fas fa-lock" />
              <h3>
                <FormattedMessage
                  id="patient.profile.changePassword"
                  defaultMessage="Đổi mật khẩu"
                />
              </h3>
            </div>
            <i
              className={`fas fa-chevron-${showChangePassword ? "up" : "down"}`}
            />
          </div>

          {showChangePassword && (
            <div className="password-body">
              <div className="password-form">
                <div className="form-group">
                  <label>
                    <FormattedMessage
                      id="patient.profile.oldPassword"
                      defaultMessage="Mật khẩu hiện tại"
                    />
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder={
                        language === LANGUAGES.VI
                          ? "Nhập mật khẩu hiện tại"
                          : "Enter current password"
                      }
                    />
                    <i
                      className={`fas fa-eye${showOldPassword ? "-slash" : ""}`}
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <FormattedMessage
                      id="patient.profile.newPassword"
                      defaultMessage="Mật khẩu mới"
                    />
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={
                        language === LANGUAGES.VI
                          ? "Nhập mật khẩu mới (ít nhất 6 ký tự)"
                          : "Enter new password (min 6 characters)"
                      }
                    />
                    <i
                      className={`fas fa-eye${showNewPassword ? "-slash" : ""}`}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <FormattedMessage
                      id="patient.profile.confirmPassword"
                      defaultMessage="Xác nhận mật khẩu mới"
                    />
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={
                        language === LANGUAGES.VI
                          ? "Nhập lại mật khẩu mới"
                          : "Confirm new password"
                      }
                    />
                    <i
                      className={`fas fa-eye${
                        showConfirmPassword ? "-slash" : ""
                      }`}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleSavePassword}>
                  <i className="fas fa-check" />
                  <span>
                    <FormattedMessage
                      id="patient.profile.savePassword"
                      defaultMessage="Đổi mật khẩu"
                    />
                  </span>
                </button>
                <button className="btn-cancel" onClick={handleCancelPassword}>
                  <i className="fas fa-times" />
                  <span>
                    <FormattedMessage
                      id="patient.profile.cancel"
                      defaultMessage="Huỷ"
                    />
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientProfile;
