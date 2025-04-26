import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { FaHome, FaUserGraduate, FaSyringe, FaChartBar } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="p-3 text-center">
        <h4>School Vaccination Portal</h4>
      </div>
      <Nav className="flex-column p-3">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaHome /> Dashboard
        </NavLink>
        <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaUserGraduate /> Students
        </NavLink>
        <NavLink to="/vaccination-drives" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaSyringe /> Vaccination Drives
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaChartBar /> Reports
        </NavLink>
      </Nav>
    </div>
  );
};

export default Sidebar;