import React, { useState, useEffect, useCallback } from 'react';

import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import emitter from "../../../utils/emitter";

interface IModalUserProps {
  isOpen: boolean;
  toggleFromParent: () => void;
  createNewUser: (data: any) => void;
}

const ModalUser: React.FC<IModalUserProps> = ({ isOpen, toggleFromParent, createNewUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");

  // Lắng nghe emitter để xóa dữ liệu modal
  useEffect(() => {
    const handler = () => {
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setAddress("");
    };
    emitter.on("EVENT_CLEAR_MODAL_DATA", handler);
    return () => {
      emitter.removeListener("EVENT_CLEAR_MODAL_DATA", handler);
    };
  }, []);

  const toggle = useCallback(() => {
    toggleFromParent();
  }, [toggleFromParent]);

  const handleOnChangeInput = useCallback((event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const value = event.target.value;
    switch (id) {
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

  const handleAddNewUser = useCallback(() => {
    let isValid = checkValidateInput();
    if (isValid === true) {
      createNewUser({ email, password, firstName, lastName, address });
    }
  }, [checkValidateInput, createNewUser, email, password, firstName, lastName, address]);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={"ClassNameModalUser"}
      size="lg"
    >
      <ModalHeader toggle={toggle}>Create A New User </ModalHeader>
      <ModalBody>
        <div className="container">
          <div className="row">
            <div className="col-6 form-group">
              <label>Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="Email"
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
            handleAddNewUser();
          }}
        >
          Create User
        </button>
        <button className="btn btn-secondary px-3" onClick={toggle}>
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalUser;


