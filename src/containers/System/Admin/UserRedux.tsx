import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CRUD_ACTIONS, USER_ROLE } from "../../../utils";
import * as actions from "../../../store/actions";
import { handleGetAllClinics } from "../../../services/clinicService";
import "./UserRedux.scss";
import TableManageUser from "./TableManageUser";
import { IRootState } from "../../../types";

const UserRedux: React.FC = () => {
  const dispatch = useDispatch();
  const listUsers = useSelector((state: IRootState) => (state.admin as any).users);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [clinicId, setClinicId] = useState<number | string>("");
  const [clinicArr, setClinicArr] = useState<any[]>([]);
  const [currentAction, setCurrentAction] = useState(CRUD_ACTIONS.CREATE);
  const [userEditId, setUserEditId] = useState<number | string>("");

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await handleGetAllClinics();
        setClinicArr(res?.errCode === 0 && Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        setClinicArr([]);
      }
    };

    fetchClinics();
  }, []);

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

    for (let i = 0; i < arrCheck.length; i++) {
      if (!fields[arrCheck[i]]) {
        alert("Missing parameter: " + arrCheck[i]);
        return false;
      }
    }

    return true;
  }, [email, password, firstName, clinicId]);

  const handleSaveUser = useCallback(() => {
    const isValid = checkValidateInput();
    if (isValid === false) return;

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
    } else if (currentAction === CRUD_ACTIONS.EDIT) {
      dispatch(actions.editUserStart({ id: userEditId as number, ...payload }) as any);
    }
  }, [checkValidateInput, clinicId, currentAction, dispatch, email, firstName, password, userEditId]);

  const onChangeInput = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, id: string) => {
    const value = event.target.value;
    switch (id) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "firstName":
        setFirstName(value);
        break;
      case "clinicId":
        setClinicId(value);
        break;
    }
  }, []);

  const handleEditUserFromParent = useCallback((user: any) => {
    setEmail(user.email || "");
    setPassword("HARDCODE");
    setFirstName(user.firstName || "");
    setClinicId(user.clinicId || "");
    setCurrentAction(CRUD_ACTIONS.EDIT);
    setUserEditId(user.id);
  }, []);

  return (
    <div className="user-crud-redux-container">
      <div className="title">Quản lý tài khoản Clinic Manager</div>

      <div className="user-redux-body">
        <div className="container">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-user-plus"></i>{" "}
                Tạo tài khoản R4 và phân quyền cơ sở y tế
              </span>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-6 form-group">
                  <label>Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(event) => onChangeInput(event, "email")}
                    disabled={currentAction === CRUD_ACTIONS.EDIT}
                  />
                </div>

                <div className="col-md-6 form-group">
                  <label>Mật khẩu</label>
                  <input
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(event) => onChangeInput(event, "password")}
                    disabled={currentAction === CRUD_ACTIONS.EDIT}
                  />
                </div>

                <div className="col-md-6 form-group">
                  <label>Tên</label>
                  <input
                    className="form-control"
                    type="text"
                    value={firstName}
                    onChange={(event) => onChangeInput(event, "firstName")}
                  />
                </div>

                <div className="col-md-6 form-group">
                  <label>Cơ sở y tế quản lý</label>
                  <select
                    className="form-select form-control"
                    onChange={(event) => onChangeInput(event, "clinicId")}
                    value={clinicId}
                  >
                    <option value="">-- Chọn cơ sở y tế --</option>
                    {clinicArr.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 btn-container">
                  <button
                    className={
                      currentAction === CRUD_ACTIONS.EDIT
                        ? "btn btn-warning btn-save-user"
                        : "btn btn-primary btn-save-user"
                    }
                    onClick={() => handleSaveUser()}
                  >
                    {currentAction === CRUD_ACTIONS.EDIT ? (
                      <span>
                        <i className="fas fa-edit"></i> Cập nhật
                      </span>
                    ) : (
                      <span>
                        <i className="fas fa-save"></i> Lưu user
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <div className="info-card">
                <div className="card-header">
                  <span>
                    <i className="fas fa-users"></i> Danh sách Clinic Manager
                  </span>
                </div>
                <div className="card-body p-0">
                  <TableManageUser
                    handleEditUserFromParentKey={handleEditUserFromParent}
                    actions={currentAction}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRedux;
