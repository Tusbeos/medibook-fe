import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar: React.FC = () => {
  return (
    <div className="sovereign-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="fas fa-briefcase-medical"></i>
        </div>
        <div className="logo-text">
          <div className="title">Sovereign Admin</div>
          <div className="subtitle">CLINICAL PRECISION</div>
        </div>
      </div>

      <div className="sidebar-menu">
        <NavLink to="/system/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <i className="fas fa-th-large"></i>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/system/user-crud-redux" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <i className="fas fa-user-friends"></i>
          <span>User Management</span>
        </NavLink>
        <NavLink to="/system/manage-doctor" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <i className="fas fa-user-md"></i>
          <span>Doctor Management</span>
        </NavLink>
        <NavLink to="/system/manage-specialty" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <i className="fas fa-shapes"></i>
          <span>Specialty Management</span>
        </NavLink>
        <NavLink to="/system/manage-clinic" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <i className="far fa-building"></i>
          <span>Facility Management</span>
        </NavLink>
        <NavLink to="/system/manage-package" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <i className="far fa-calendar-alt"></i>
          <span>Appointment Management</span>
        </NavLink>
        <NavLink to="/system/manage-patient" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <i className="far fa-user"></i>
          <span>Patient Management</span>
        </NavLink>
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
