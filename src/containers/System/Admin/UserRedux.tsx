import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CRUD_ACTIONS, USER_ROLE } from "../../../utils";
import * as actions from "../../../store/actions";
import { handleGetAllClinics } from "../../../services/clinicService";
import {
  Panel,
  PanelHeading,
  SearchBox,
  DataTable,
  ActionButtons,
  StatusBadge,
  FormField,
} from "../../../components/System/SystemShared";
import "./UserRedux.scss";
import { IRootState } from "../../../types";

const UserRedux: React.FC = () => {
  const dispatch = useDispatch();
  const listUsers = useSelector(
    (state: IRootState) => (state.admin as any).users,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [clinicId, setClinicId] = useState<number | string>("");
  const [clinicArr, setClinicArr] = useState<any[]>([]);
  const [currentAction, setCurrentAction] = useState(CRUD_ACTIONS.CREATE);
  const [userEditId, setUserEditId] = useState<number | string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await handleGetAllClinics();
        setClinicArr(
          res?.errCode === 0 && Array.isArray(res.data) ? res.data : [],
        );
      } catch (error) {
        setClinicArr([]);
      }
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    dispatch(actions.fetchAllUsersStart() as any);
  }, [dispatch]);

  useEffect(() => {
    if (listUsers) {
      setEmail("");
      setPassword("");
      setFirstName("");
      setClinicId("");
      setCurrentAction(CRUD_ACTIONS.CREATE);
      setUserEditId("");
    }
  }, [listUsers]);

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

  const handleSaveUser = useCallback(() => {
    if (!checkValidateInput()) return;
    const payload = {
      email,
      password,
      firstName,
      lastName: "",
      roleId: USER_ROLE.CLINIC_MANAGER,
      clinicId: Number(clinicId),
    };
    if (currentAction === CRUD_ACTIONS.CREATE) {
      dispatch(actions.createNewUser(payload) as any);
    } else {
      dispatch(
        actions.editUserStart({ id: userEditId as number, ...payload }) as any,
      );
    }
  }, [
    checkValidateInput,
    clinicId,
    currentAction,
    dispatch,
    email,
    firstName,
    password,
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

  const handleCancelEdit = useCallback(() => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setClinicId("");
    setCurrentAction(CRUD_ACTIONS.CREATE);
    setUserEditId("");
  }, []);

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

        <div className="user-form-grid">
          <FormField label="Email">
            <input
              className="sys-input"
              type="email"
              placeholder="Nhập email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          emptyText="Không tìm thấy người dùng nào"
          onEdit={handleEditUser}
          onDelete={(item: any) =>
            dispatch(actions.deleteUserStart(item.id) as any)
          }
        />
      </Panel>
    </div>
  );
};

export default UserRedux;
