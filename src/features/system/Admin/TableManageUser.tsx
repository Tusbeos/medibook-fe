import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./TableManageUser.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import * as actions from "../../../store/actions";
import "react-markdown-editor-lite/lib/index.css";
import { IRootState } from "../../../types";

interface ITableManageUserProps {
  handleEditUserFromParentKey: (user: any) => void;
  actions?: string;
}

const TableManageUser: React.FC<ITableManageUserProps> = ({ handleEditUserFromParentKey }) => {
  const dispatch = useDispatch();
  const listUsers = useSelector((state: IRootState) => state.admin.users);
  const [userRedux, setUserRedux] = useState<any[]>([]);

  useEffect(() => {
    dispatch(actions.fetchAllUsersStart() as any);
  }, [dispatch]);

  useEffect(() => {
    if (listUsers) {
      setUserRedux(listUsers.filter((user: any) => user.roleId === "R4"));
    }
  }, [listUsers]);

  const handleEditUser = useCallback((user: any) => {
    handleEditUserFromParentKey(user);
  }, [handleEditUserFromParentKey]);

  return (
    <React.Fragment>
      <table>
        <tbody>
          <tr>
            <th>Email</th>
            <th>FirstName</th>
            <th>LastName</th>
            <th>Address</th>
            <th>Cơ sở y tế</th>
            <th>Actions</th>
          </tr>
          {userRedux &&
            userRedux.length > 0 &&
            userRedux.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.email}</td>
                  <td>{item.firstName}</td>
                  <td>{item.lastName}</td>
                  <td>{item.address}</td>
                  <td>{item.clinicName || "Chưa phân quyền"}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditUser(item)}
                    >
                      <i className="fas fa-pencil"></i>
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => dispatch(actions.deleteUserStart(item.id) as any)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </React.Fragment>
  );
};

export default TableManageUser;
