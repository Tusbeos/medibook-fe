import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CRUD_ACTIONS, USER_ROLE } from "../../../utils";
import { generateMedibookEmail } from "../../../utils/CommonUtils";
import { toast } from "react-toastify";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetClinicsQuery,
  useGetUsersQuery,
  useLazyGenerateUserEmailQuery,
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

const UserRedux: React.FC = () => {
  const [page, setPage] = useState(0);
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useGetUsersQuery({ page, size: 10, roleId: USER_ROLE.CLINIC_MANAGER });
  const {
    data: clinicsResponse,
    isLoading: isLoadingClinics,
    isFetching: isFetchingClinics,
    isError: isClinicsError,
    refetch: refetchClinics,
  } = useGetClinicsQuery();
  const [generateUserEmail] = useLazyGenerateUserEmailQuery();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [clinicId, setClinicId] = useState<number | string>("");
  const [currentAction, setCurrentAction] = useState(CRUD_ACTIONS.CREATE);
  const [userEditId, setUserEditId] = useState<number | string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Auto-generate email for R4: firstName@mgr.medibook.com (BE API with debounce)
  useEffect(() => {
    if (currentAction !== CRUD_ACTIONS.CREATE) return;
    if (!firstName) {
      setEmail("");
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await generateUserEmail({
          firstName,
          role: "R4",
        }).unwrap();
        if (res?.errCode === 0 && res.data) {
          setEmail(res.data);
        } else {
          setEmail(generateMedibookEmail(firstName, undefined, "R4"));
        }
      } catch {
        setEmail(generateMedibookEmail(firstName, undefined, "R4"));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentAction, firstName, generateUserEmail]);

  const checkValidateInput = useCallback(() => {
    const fields: Record<string, string> = {
      email,
      password,
      firstName,
      clinicId: String(clinicId),
    };
    const arrCheck = ["email", "password", "firstName", "clinicId"];
    for (const key of arrCheck) {
      if (!fields[key]) {
        alert("Missing parameter: " + key);
        return false;
      }
    }
    return true;
  }, [email, password, firstName, clinicId]);

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setClinicId("");
    setCurrentAction(CRUD_ACTIONS.CREATE);
    setUserEditId("");
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!checkValidateInput()) return;
    const payload = {
      email,
      password,
      firstName,
      lastName: "",
      roleId: USER_ROLE.CLINIC_MANAGER,
      clinicId: Number(clinicId),
    };
    try {
      const res =
        currentAction === CRUD_ACTIONS.CREATE
          ? await createUser(payload).unwrap()
          : await updateUser({
              id: userEditId as number,
              ...payload,
            }).unwrap();
      if (res?.errCode === 0) {
        toast.success(
          currentAction === CRUD_ACTIONS.CREATE
            ? "Tạo Clinic Manager thành công."
            : "Cập nhật Clinic Manager thành công.",
        );
        resetForm();
        return;
      }
      toast.error(res?.errMessage || "Lưu Clinic Manager thất bại.");
    } catch {
      toast.error("Lưu Clinic Manager thất bại.");
    }
  }, [
    checkValidateInput,
    clinicId,
    createUser,
    currentAction,
    email,
    firstName,
    password,
    resetForm,
    updateUser,
    userEditId,
  ]);

  const handleEditUser = useCallback((user: any) => {
    setEmail(user.email || "");
    setPassword("HARDCODE");
    setFirstName(user.firstName || "");
    setClinicId(user.clinicId || "");
    setCurrentAction(CRUD_ACTIONS.EDIT);
    setUserEditId(user.id);
  }, []);

  const handleCancelEdit = resetForm;

  const handleDeleteUser = useCallback(
    async (userId: number | string) => {
      try {
        const res = await deleteUser(userId).unwrap();
        if (res?.errCode === 0) {
          toast.success("Xóa Clinic Manager thành công.");
          if (String(userEditId) === String(userId)) resetForm();
          return;
        }
        toast.error(res?.errMessage || "Xóa Clinic Manager thất bại.");
      } catch {
        toast.error("Xóa Clinic Manager thất bại.");
      }
    },
    [deleteUser, resetForm, userEditId],
  );

  const filteredUsers = useMemo(() => {
    const r4Users = (listUsers || []).filter((u: any) => u.roleId === "R4");
    if (!searchTerm.trim()) return r4Users;
    const term = searchTerm.toLowerCase();
    return r4Users.filter(
      (u: any) =>
        (u.email || "").toLowerCase().includes(term) ||
        (u.firstName || "").toLowerCase().includes(term) ||
        (u.clinicName || "").toLowerCase().includes(term),
    );
  }, [listUsers, searchTerm]);

  const columns = useMemo(
    () => [
      { key: "email", title: "Email" },
      {
        key: "name",
        title: "Tên",
        render: (item: any) => (
          <span className="user-name-text">
            {item.firstName} {item.lastName}
          </span>
        ),
      },
      {
        key: "clinic",
        title: "Cơ sở y tế",
        render: (item: any) =>
          item.clinicName ? (
            <StatusBadge label={item.clinicName} variant="success" />
          ) : (
            <StatusBadge label="Chưa phân quyền" variant="warning" />
          ),
      },
    ],
    [],
  );
  const isLoadingData =
    isLoadingUsers ||
    isFetchingUsers ||
    isLoadingClinics ||
    isFetchingClinics;
  const isSavingUser = isCreatingUser || isUpdatingUser || isDeletingUser;
  const hasDataError = isUsersError || isClinicsError;

  return (
    <div className="manage-user-container">
      <Panel>
        <PanelHeading
          title={
            currentAction === CRUD_ACTIONS.EDIT
              ? "Cập nhật tài khoản Clinic Manager"
              : "Tạo tài khoản Clinic Manager"
          }
          icon="fas fa-user-plus"
        />

        {isSavingUser && (
          <div className="alert alert-info">Đang xử lý yêu cầu...</div>
        )}

        <div className="user-form-grid">
          <FormField label="Email">
            <input
              className="sys-input readonly-input"
              type="email"
              placeholder="Tự động tạo từ tên"
              value={email}
              readOnly
              disabled={currentAction === CRUD_ACTIONS.EDIT}
            />
          </FormField>

          <FormField label="Mật khẩu">
            <input
              className="sys-input"
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={currentAction === CRUD_ACTIONS.EDIT}
            />
          </FormField>

          <FormField label="Tên">
            <input
              className="sys-input"
              type="text"
              placeholder="Nhập tên..."
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </FormField>

          <FormField label="Cơ sở y tế quản lý">
            <select
              className="sys-input"
              onChange={(e) => setClinicId(e.target.value)}
              value={clinicId}
            >
              <option value="">-- Chọn cơ sở y tế --</option>
              {clinicArr.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <ActionButtons
          isEditing={currentAction === CRUD_ACTIONS.EDIT}
          onSave={handleSaveUser}
          onCancel={handleCancelEdit}
          saveLabel="LƯU USER"
          editLabel="CẬP NHẬT"
        />
      </Panel>

      <Panel>
        <PanelHeading title="Danh sách Clinic Manager" icon="fas fa-users">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm kiếm theo tên, email, cơ sở..."
          />
        </PanelHeading>

        <DataTable
          columns={columns}
          data={filteredUsers}
          rowKey={(item: any) => item.id}
          isLoading={isLoadingData}
          isError={hasDataError}
          loadingText="Đang tải danh sách Clinic Manager..."
          errorText="Không thể tải danh sách Clinic Manager."
          emptyText={
            searchTerm.trim()
              ? "Không có Clinic Manager phù hợp với từ khóa."
              : "Chưa có Clinic Manager nào."
          }
          onRetry={() => {
            void refetchUsers();
            void refetchClinics();
          }}
          onEdit={handleEditUser}
          onDelete={(item: any) => void handleDeleteUser(item.id)}
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
