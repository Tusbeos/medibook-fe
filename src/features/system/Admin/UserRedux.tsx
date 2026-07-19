import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CRUD_ACTIONS, USER_ROLE } from "../../../utils";
import CommonUtils, {
  generateMedibookEmail,
  normalizeImageSrc,
} from "../../../utils/CommonUtils";
import {
  ACCOUNT_STATUS_OPTIONS,
  type AccountStatus,
  getAccountStatusMeta,
} from "../../../utils/accountStatus";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAllCodeQuery,
  useGetClinicsQuery,
  useGetUsersQuery,
  useLazyGenerateUserEmailQuery,
  useUpdateUserAccountStatusMutation,
  useUpdateUserMutation,
} from "../../../store/api/publicApi";
import {
  Panel,
  PanelHeading,
  SearchBox,
  DataTable,
  ActionButtons,
  StatusBadge,
  FormField,
} from "components/System/SystemShared";
import "./UserRedux.scss";

interface UserReduxProps {
  roleId?: string;
}

type FormFieldKey =
  | "email"
  | "password"
  | "firstName"
  | "lastName"
  | "gender"
  | "clinicId"
  | "avatar";

type FormErrors = Partial<Record<FormFieldKey, string>>;

const getApiErrorMessage = (error: any, fallback: string) =>
  error?.data?.errMessage ||
  error?.data?.message ||
  error?.response?.data?.errMessage ||
  error?.response?.data?.message ||
  fallback;

const UserRedux: React.FC<UserReduxProps> = ({
  roleId = USER_ROLE.CLINIC_MANAGER,
}) => {
  const isWriter = roleId === USER_ROLE.WRITER;
  const roleLabel = isWriter ? "Writer" : "Clinic Manager";
  const [page, setPage] = useState(0);
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useGetUsersQuery({ page, size: 10, roleId });
  const {
    data: clinicsResponse,
    isLoading: isLoadingClinics,
    isFetching: isFetchingClinics,
    isError: isClinicsError,
    refetch: refetchClinics,
  } = useGetClinicsQuery(undefined, { skip: isWriter });
  const {
    data: gendersResponse,
    isLoading: isLoadingGenders,
    isFetching: isFetchingGenders,
    isError: isGendersError,
    refetch: refetchGenders,
  } = useGetAllCodeQuery("GENDER");
  const [generateUserEmail] = useLazyGenerateUserEmailQuery();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();
  const [updateUserAccountStatus] = useUpdateUserAccountStatusMutation();

  const listUsers = useMemo(
    () =>
      usersResponse?.errCode === 0 && Array.isArray(usersResponse.data)
        ? usersResponse.data
        : [],
    [usersResponse],
  );
  const clinicArr = useMemo(
    () =>
      clinicsResponse?.errCode === 0 && Array.isArray(clinicsResponse.data)
        ? clinicsResponse.data
        : [],
    [clinicsResponse],
  );
  const genderArr = useMemo(
    () =>
      gendersResponse?.errCode === 0 && Array.isArray(gendersResponse.data)
        ? gendersResponse.data
        : [],
    [gendersResponse],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [clinicId, setClinicId] = useState<number | string>("");
  const [currentAction, setCurrentAction] = useState(CRUD_ACTIONS.CREATE);
  const [userEditId, setUserEditId] = useState<number | string>("");
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState<
    number | string
  >();
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const clearFormError = useCallback((field: FormFieldKey) => {
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  useEffect(() => {
    if (!gender && genderArr.length > 0) {
      setGender(genderArr[0].keyMap || "");
    }
  }, [gender, genderArr]);

  useEffect(() => {
    if (currentAction !== CRUD_ACTIONS.CREATE) return;
    if (!firstName && !lastName) {
      setEmail("");
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await generateUserEmail({
          firstName,
          lastName,
          role: roleId,
        }).unwrap();
        setEmail(
          res?.errCode === 0 && res.data
            ? res.data
            : generateMedibookEmail(firstName, lastName, roleId),
        );
      } catch {
        setEmail(generateMedibookEmail(firstName, lastName, roleId));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentAction, firstName, generateUserEmail, lastName, roleId]);

  const validateForm = useCallback(() => {
    const errors: FormErrors = {};
    if (currentAction === CRUD_ACTIONS.CREATE) {
      if (!email.trim()) errors.email = "Email đang được tạo, vui lòng chờ.";
      if (!password) errors.password = "Vui lòng nhập mật khẩu.";
      else if (password.length < 6)
        errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (!firstName.trim()) errors.firstName = "Vui lòng nhập tên.";
    if (!lastName.trim()) errors.lastName = "Vui lòng nhập họ.";
    if (!gender) errors.gender = "Vui lòng chọn giới tính.";
    if (!isWriter && !clinicId)
      errors.clinicId = "Vui lòng chọn cơ sở y tế quản lý.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [clinicId, currentAction, email, firstName, gender, isWriter, lastName, password]);

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setAddress("");
    setGender(genderArr[0]?.keyMap || "");
    setAvatar("");
    setAvatarPreview("");
    setClinicId("");
    setCurrentAction(CRUD_ACTIONS.CREATE);
    setUserEditId("");
    setFormErrors({});
  }, [genderArr]);

  const handleAvatarChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setFormErrors((current) => ({
          ...current,
          avatar: "Chỉ chấp nhận tệp hình ảnh.",
        }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors((current) => ({
          ...current,
          avatar: "Ảnh đại diện không được vượt quá 2 MB.",
        }));
        return;
      }
      try {
        const base64 = await CommonUtils.getBase64(file);
        setAvatar(base64);
        setAvatarPreview(base64);
        clearFormError("avatar");
      } catch {
        setFormErrors((current) => ({
          ...current,
          avatar: "Không thể đọc tệp ảnh đã chọn.",
        }));
      }
    },
    [clearFormError],
  );

  const handleSaveUser = useCallback(async () => {
    if (!validateForm()) return;
    const userData: Record<string, any> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      gender,
      roleId,
    };
    if (!isWriter) userData.clinicId = Number(clinicId);
    if (avatar) userData.avatar = avatar;

    try {
      const res =
        currentAction === CRUD_ACTIONS.CREATE
          ? await createUser({
              ...userData,
              email: email.trim(),
              password,
            }).unwrap()
          : await updateUser({ id: userEditId, ...userData }).unwrap();
      if (res?.errCode === 0) {
        toast.success(
          currentAction === CRUD_ACTIONS.CREATE
            ? `Tạo ${roleLabel} thành công.`
            : `Cập nhật ${roleLabel} thành công.`,
        );
        resetForm();
        return;
      }
      toast.error(res?.errMessage || `Lưu ${roleLabel} thất bại.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Lưu ${roleLabel} thất bại.`));
    }
  }, [
    address,
    avatar,
    clinicId,
    createUser,
    currentAction,
    email,
    firstName,
    gender,
    isWriter,
    lastName,
    password,
    phoneNumber,
    resetForm,
    roleId,
    roleLabel,
    updateUser,
    userEditId,
    validateForm,
  ]);

  const handleEditUser = useCallback((user: any) => {
    setEmail(user.email || "");
    setPassword("");
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhoneNumber(user.phoneNumber || "");
    setAddress(user.address || "");
    setGender(user.gender || "");
    setAvatar("");
    setAvatarPreview(normalizeImageSrc(user.image));
    setClinicId(user.clinicId || "");
    setCurrentAction(CRUD_ACTIONS.EDIT);
    setUserEditId(user.id);
    setFormErrors({});
  }, []);

  const handleDeleteUser = useCallback(
    async (user: any) => {
      const displayName = `${user.lastName || ""} ${user.firstName || ""}`.trim();
      if (
        !window.confirm(
          `Xóa vĩnh viễn tài khoản ${displayName || user.email}? Hành động này không thể hoàn tác.`,
        )
      )
        return;
      try {
        const res = await deleteUser(user.id).unwrap();
        if (res?.errCode === 0) {
          toast.success(`Xóa ${roleLabel} thành công.`);
          if (String(userEditId) === String(user.id)) resetForm();
          return;
        }
        toast.error(res?.errMessage || `Xóa ${roleLabel} thất bại.`);
      } catch (error) {
        toast.error(getApiErrorMessage(error, `Xóa ${roleLabel} thất bại.`));
      }
    },
    [deleteUser, resetForm, roleLabel, userEditId],
  );

  const handleAccountStatusChange = useCallback(
    async (user: any, status: AccountStatus) => {
      if (status === user.accountStatus) return;
      const statusMeta = getAccountStatusMeta(status);
      if (
        status !== "ACTIVE" &&
        !window.confirm(
          `Chuyển tài khoản ${user.email} sang trạng thái “${statusMeta?.label}”?`,
        )
      )
        return;
      setStatusUpdatingUserId(user.id);
      try {
        const res = await updateUserAccountStatus({
          userId: user.id,
          status,
        }).unwrap();
        if (res?.errCode === 0) {
          toast.success("Cập nhật trạng thái tài khoản thành công.");
          return;
        }
        toast.error(res?.errMessage || "Cập nhật trạng thái thất bại.");
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Cập nhật trạng thái tài khoản thất bại."),
        );
      } finally {
        setStatusUpdatingUserId(undefined);
      }
    },
    [updateUserAccountStatus],
  );

  const filteredUsers = useMemo(() => {
    const roleUsers = (listUsers || []).filter((u: any) => u.roleId === roleId);
    if (!searchTerm.trim()) return roleUsers;
    const term = searchTerm.toLowerCase();
    return roleUsers.filter((u: any) =>
      [
        u.email,
        u.firstName,
        u.lastName,
        u.phoneNumber,
        u.clinicName,
        getAccountStatusMeta(u.accountStatus)?.label,
      ].some((value) => String(value || "").toLowerCase().includes(term)),
    );
  }, [listUsers, roleId, searchTerm]);

  const columns = useMemo(() => {
    const baseColumns: any[] = [
      { key: "email", title: "Email" },
      {
        key: "name",
        title: "Họ tên",
        render: (item: any) => (
          <span className="user-name-text">
            {item.lastName} {item.firstName}
          </span>
        ),
      },
      {
        key: "contact",
        title: "Liên hệ",
        render: (item: any) => (
          <div className="user-contact-cell">
            <span>{item.phoneNumber || "Chưa cập nhật"}</span>
            <small>{item.genderVi || "Chưa chọn giới tính"}</small>
          </div>
        ),
      },
    ];
    if (!isWriter) {
      baseColumns.push({
        key: "clinic",
        title: "Cơ sở y tế",
        render: (item: any) =>
          item.clinicName ? (
            <StatusBadge label={item.clinicName} variant="success" />
          ) : (
            <StatusBadge label="Chưa phân quyền" variant="warning" />
          ),
      });
    }
    baseColumns.push({
      key: "accountStatus",
      title: "Trạng thái tài khoản",
      render: (item: any) => {
        const statusMeta = getAccountStatusMeta(item.accountStatus);
        return (
          <div className="user-account-status-control">
            <StatusBadge
              label={statusMeta?.label || "Không xác định"}
              variant={statusMeta?.variant || "default"}
            />
            <select
              className="user-account-status-select"
              aria-label={`Đổi trạng thái tài khoản ${item.email}`}
              value={item.accountStatus || ""}
              disabled={String(statusUpdatingUserId) === String(item.id)}
              onChange={(event) =>
                void handleAccountStatusChange(
                  item,
                  event.target.value as AccountStatus,
                )
              }
            >
              {!statusMeta && <option value="">Chọn trạng thái</option>}
              {ACCOUNT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      },
    });
    return baseColumns;
  }, [handleAccountStatusChange, isWriter, statusUpdatingUserId]);

  const isLoadingData =
    isLoadingUsers ||
    isFetchingUsers ||
    isLoadingGenders ||
    isFetchingGenders ||
    (!isWriter && (isLoadingClinics || isFetchingClinics));
  const isSavingUser = isCreatingUser || isUpdatingUser || isDeletingUser;
  const hasDataError =
    isUsersError || isGendersError || (!isWriter && isClinicsError);

  return (
    <div className="manage-user-container">
      <Panel>
        <PanelHeading
          title={
            currentAction === CRUD_ACTIONS.EDIT
              ? `Cập nhật tài khoản ${roleLabel}`
              : `Tạo tài khoản ${roleLabel}`
          }
          icon="fas fa-user-plus"
        />

        {isSavingUser && (
          <div className="alert alert-info">Đang xử lý yêu cầu...</div>
        )}

        <div className="user-form-grid">
          <FormField label="Email" required error={formErrors.email}>
            <input
              className="sys-input readonly-input"
              type="email"
              placeholder="Tự động tạo từ họ tên"
              value={email}
              readOnly
              disabled={currentAction === CRUD_ACTIONS.EDIT}
              aria-invalid={Boolean(formErrors.email)}
            />
          </FormField>

          {currentAction === CRUD_ACTIONS.CREATE && (
            <FormField label="Mật khẩu" required error={formErrors.password}>
              <input
                className="sys-input"
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFormError("password");
                }}
                aria-invalid={Boolean(formErrors.password)}
              />
            </FormField>
          )}

          <FormField label="Họ" required error={formErrors.lastName}>
            <input
              className="sys-input"
              type="text"
              placeholder="Nhập họ..."
              value={lastName}
              onChange={(event) => {
                setLastName(event.target.value);
                clearFormError("lastName");
              }}
              aria-invalid={Boolean(formErrors.lastName)}
            />
          </FormField>

          <FormField label="Tên" required error={formErrors.firstName}>
            <input
              className="sys-input"
              type="text"
              placeholder="Nhập tên..."
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
                clearFormError("firstName");
              }}
              aria-invalid={Boolean(formErrors.firstName)}
            />
          </FormField>

          <FormField label="Số điện thoại">
            <input
              className="sys-input"
              type="tel"
              placeholder="Nhập số điện thoại..."
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />
          </FormField>

          <FormField label="Giới tính" required error={formErrors.gender}>
            <select
              className="sys-input"
              value={gender}
              onChange={(event) => {
                setGender(event.target.value);
                clearFormError("gender");
              }}
              aria-invalid={Boolean(formErrors.gender)}
            >
              <option value="">-- Chọn giới tính --</option>
              {genderArr.map((item: any) => (
                <option key={item.keyMap} value={item.keyMap}>
                  {item.valueVi || item.valueEn}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Địa chỉ">
            <input
              className="sys-input"
              type="text"
              placeholder="Nhập địa chỉ..."
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </FormField>

          {!isWriter && (
            <FormField
              label="Cơ sở y tế quản lý"
              required
              error={formErrors.clinicId}
            >
              <select
                className="sys-input"
                onChange={(event) => {
                  setClinicId(event.target.value);
                  clearFormError("clinicId");
                }}
                value={clinicId}
                aria-invalid={Boolean(formErrors.clinicId)}
              >
                <option value="">-- Chọn cơ sở y tế --</option>
                {clinicArr.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <div className="user-avatar-field">
            <FormField label="Ảnh đại diện" error={formErrors.avatar}>
              <input
                className="sys-input user-avatar-input"
                type="file"
                accept="image/*"
                onChange={(event) => void handleAvatarChange(event)}
              />
            </FormField>
            {avatarPreview && (
              <img
                className="user-avatar-preview"
                src={avatarPreview}
                alt="Xem trước ảnh đại diện"
              />
            )}
          </div>
        </div>

        <ActionButtons
          isEditing={currentAction === CRUD_ACTIONS.EDIT}
          onSave={handleSaveUser}
          onCancel={resetForm}
          saveLabel="LƯU TÀI KHOẢN"
          editLabel="CẬP NHẬT"
          disabled={isSavingUser}
        />
      </Panel>

      <Panel>
        <PanelHeading title={`Danh sách ${roleLabel}`} icon="fas fa-users">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={
              isWriter
                ? "Tìm theo họ tên, email, số điện thoại..."
                : "Tìm theo họ tên, email, cơ sở..."
            }
          />
        </PanelHeading>

        <DataTable
          columns={columns}
          data={filteredUsers}
          rowKey={(item: any) => item.id}
          isLoading={isLoadingData}
          isError={hasDataError}
          loadingText={`Đang tải danh sách ${roleLabel}...`}
          errorText={`Không thể tải danh sách ${roleLabel}.`}
          emptyText={
            searchTerm.trim()
              ? `Không có ${roleLabel} phù hợp với từ khóa.`
              : `Chưa có ${roleLabel} nào.`
          }
          onRetry={() => {
            void refetchUsers();
            void refetchGenders();
            if (!isWriter) void refetchClinics();
          }}
          onEdit={handleEditUser}
          onDelete={(item: any) => void handleDeleteUser(item)}
        />
        {(usersResponse?.pagination?.totalPages || 0) > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-3 py-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={usersResponse?.pagination?.first || isFetchingUsers}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Trang trước
            </button>
            <span>
              Trang {page + 1}/{usersResponse?.pagination?.totalPages || 1}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={usersResponse?.pagination?.last || isFetchingUsers}
              onClick={() => setPage((current) => current + 1)}
            >
              Trang sau
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default UserRedux;
