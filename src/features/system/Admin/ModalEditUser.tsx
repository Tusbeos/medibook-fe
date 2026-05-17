import React, { useState, useEffect, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import _ from "lodash";
import { IUser } from "../../../types";

interface IModalEditUserProps {
  isOpen: boolean;
  toggleFromParent: () => void;
  currentUser: IUser;
  editUser: (data: any) => void;
}

const ModalEditUser: React.FC<IModalEditUserProps> = ({ isOpen, toggleFromParent, currentUser, editUser }) => {
  const [id, setId] = useState<number | string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");

  // Khởi tạo dữ liệu từ currentUser khi mount
  useEffect(() => {
    if (currentUser && !_.isEmpty(currentUser)) {
      setId(currentUser.id);
      setEmail(currentUser.email);
      setPassword("harcode");
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setAddress(currentUser.address);
    }
  }, [currentUser]);

  const toggle = useCallback(() => {
    toggleFromParent();
  }, [toggleFromParent]);

  const handleOnChangeInput = useCallback((event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = event.target.value;
    switch (field) {
      case "email": setEmail(value); break;
      case "password": setPassword(value); break;
      case "firstName": setFirstName(value); break;
      case "lastName": setLastName(value); break;
      case "address": setAddress(value); break;
    }
  }, []);

  const checkValidateInput = useCallback(() => {
    const fields: Record<string, string> = { email, password, firstName, lastName, address };
    const arrInput = ["email", "password", "firstName", "lastName", "address"];
    for (let i = 0; i < arrInput.length; i++) {
      if (!fields[arrInput[i]]) {
        alert("Missing parameter: " + arrInput[i]);
        return false;
      }
    }
    return true;
  }, [email, password, firstName, lastName, address]);

  const handleSaveUser = useCallback(() => {
    let isValid = checkValidateInput();
    if (isValid === true) {
      editUser({ id, email, password, firstName, lastName, address });
    }
  }, [checkValidateInput, editUser, id, email, password, firstName, lastName, address]);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={"ClassNameModalEditUser"}
      size="lg"
    >
      <ModalHeader toggle={toggle}>Edit User </ModalHeader>
      <ModalBody>
        <div className="container">
          <div className="row">
            <div className="col-6 form-group">
              <label>Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="Email"
                disabled
                onChange={(event) => {
                  handleOnChangeInput(event, "email");
                }}
                value={email}
              />
            </div>
            <div className="col-6 form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                disabled
                onChange={(event) => {
                  handleOnChangeInput(event, "password");
                }}
                value={password}
              />
            </div>
            <div className="col-6 form-group mt-3">
              <label>First Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="FirstName"
                onChange={(event) => {
                  handleOnChangeInput(event, "firstName");
                }}
                value={firstName}
              />
            </div>
            <div className="col-6 form-group mt-3">
              <label>Last Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="LastName"
                onChange={(event) => {
                  handleOnChangeInput(event, "lastName");
                }}
                value={lastName}
              />
            </div>
            <div className="col-12 form-group mt-3">
              <label>Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="Address"
                onChange={(event) => {
                  handleOnChangeInput(event, "address");
                }}
                value={address}
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          className="btn btn-primary px-3 "
          onClick={() => {
            handleSaveUser();
          }}
        >
          Save Changes
        </button>
        <button className="btn btn-secondary px-3" onClick={toggle}>
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalEditUser;
