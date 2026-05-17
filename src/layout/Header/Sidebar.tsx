import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import "./Sidebar.scss";
import logo from "assets/Logo Medibook.png";
import { IRootState } from "types";
import { USER_ROLE } from "utils";

const Sidebar: React.FC = () => {
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const roleId = userInfo?.roleId || (userInfo as any)?.roleData?.keyMap;

  const menuItems =
    roleId === USER_ROLE.DOCTOR
      ? [
          {
            to: "/doctor/manage-schedule",
            icon: "fas fa-calendar-alt",
            label: "Quản lý lịch khám",
            end: true,
          },
          {
            to: "/doctor/manage-patient",
            icon: "fas fa-procedures",
            label: "Quản lý bệnh nhân",
          },
        ]
      : roleId === USER_ROLE.CLINIC_MANAGER
        ? [
            {
              to: "/system/clinic-manager",
              icon: "fas fa-chart-line",
              label: "Tổng quan",
              end: true,
            },
            {
              to: "/system/clinic-manager/doctors",
              icon: "fas fa-user-md",
              label: "Bác sĩ",
            },
            {
              to: "/system/clinic-manager/schedules",
              icon: "fas fa-calendar-alt",
              label: "Lịch bác sĩ",
            },
            {
              to: "/system/clinic-manager/bookings",
              icon: "fas fa-calendar-check",
              label: "Lịch hẹn",
            },
            {
              to: "/system/clinic-manager/packages",
              icon: "fas fa-briefcase-medical",
              label: "Gói khám",
            },
            {
              to: "/system/clinic-manager/approvals",
              icon: "fas fa-clipboard-check",
              label: "Phê duyệt",
            },
          ]
        : [
            {
              to: "/system/user-management",
              icon: "fas fa-user-shield",
              label: "Quản lý Clinic Manager",
            },
            {
              to: "/system/manage-doctor",
              icon: "fas fa-user-md",
              label: "Quản lý bác sĩ",
            },
            {
              to: "/system/manage-specialty",
              icon: "fas fa-shapes",
              label: "Quản lý chuyên khoa",
            },
            {
              to: "/system/manage-clinic",
              icon: "far fa-building",
              label: "Quản lý cơ sở y tế",
            },
            {
              to: "/system/manage-package",
              icon: "far fa-calendar-alt",
              label: "Quản lý gói khám",
            },
          ];

  return (
    <div className="sovereign-sidebar">
      <div className="sidebar-logo">
        <img className="logo-image" src={logo} alt="MediBookl logo" />
        <div className="logo-text">
          <div className="title">MediBook</div>
          <div className="subtitle">Hệ thống đặt lịch khám</div>
        </div>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={(item as any).end}
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
