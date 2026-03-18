import React from 'react';
import { useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import UserRedux from "../containers/System/Admin/UserRedux";
import ManageDoctor from "../containers/System/Doctor/ManageDoctor";
import Header from "containers/Header/Header";
import ManageSpecialty from "containers/System/Specialty/ManageSpecialty";
import ManageClinic from "containers/System/Clinic/ManageClinic";
import ManagePackage from "containers/System/Package/ManagePackage";
import { IRootState } from "../types";

const System = () => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);

  return (
    <React.Fragment>
      {isLoggedIn && <Header />}
      <div className="system-container">
        <div className="system-list">
          <Switch>
            <Route path="/system/user-crud-redux" component={UserRedux} />
            <Route path="/system/manage-doctor" component={ManageDoctor} />
            <Route
              path="/system/manage-specialty"
              component={ManageSpecialty}
            />
            <Route path="/system/manage-clinic" component={ManageClinic} />
            <Route path="/system/manage-package" component={ManagePackage} />
            <Route render={() => <UserRedux />} />
          </Switch>
        </div>
      </div>
    </React.Fragment>
  );
};

export default System;
