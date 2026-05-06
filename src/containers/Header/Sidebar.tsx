import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import "./Sidebar.scss";
import logo from "../../assets/Logo.png";
import { IRootState } from "../../types";
import { USER_ROLE } from "../../utils";

const Sidebar: React.FC = () => {
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const roleId = userInfo?.roleId || (userInfo as any)?.roleData?.keyMap;

  const menuItems =
    roleId === USER_ROLE.CLINIC_MANAGER
      ? [
          {
            to: "/system/clinic-manager",
            icon: "fas fa-th-large",
            label: "Clinic Manager - Admin",
          },
        ]
      : [
          {
            to: "/system/user-management",
            icon: "fas fa-user-shield",
            label: "Clinic Manager",
          },
          {
            to: "/system/manage-doctor",
            icon: "fas fa-user-md",
            label: "Doctor Management",
          },
          {
            to: "/system/manage-specialty",
            icon: "fas fa-shapes",
            label: "Specialty Management",
          },
          {
            to: "/system/manage-clinic",
            icon: "far fa-building",
            label: "Facility Management",
          },
          {
            to: "/system/manage-package",
            icon: "far fa-calendar-alt",
            label: "Management Package",
          },
          {
            to: "/system/manage-patient",
            icon: "far fa-user",
            label: "Patient Management",
          },
        ];

  return (
    <div className="sovereign-sidebar">
      <div className="sidebar-logo">
        <img className="logo-image" src={logo} alt="MediBookl logo" />
        <div className="logo-text">
          <div className="title">MediBook</div>
          <div className="subtitle">MEDICAL BOOKING</div>
        </div>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button className="btn-quick-appointment">
          <i className="fas fa-plus"></i> Quick Appointment
        </button>
        <div className="bottom-menu">
          <div className="menu-item">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </div>
          <div className="menu-item">
            <i className="far fa-question-circle"></i>
            <span>Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
