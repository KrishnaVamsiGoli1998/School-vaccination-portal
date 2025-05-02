import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { FaHome, FaUserGraduate, FaSyringe, FaChartBar, FaBars, FaArrowLeft } from 'react-icons/fa';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/students', icon: <FaUserGraduate />, label: 'Students' },
    { path: '/vaccination-drives', icon: <FaSyringe />, label: 'Vaccination Drives' },
    { path: '/reports', icon: <FaChartBar />, label: 'Reports' }
  ];
  
  return (
    <div 
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}
      style={{
        width: collapsed ? '70px' : '250px',
        transition: 'width 0.3s ease'
      }}
    >
      <div className={`sidebar-header ${collapsed ? 'text-center' : ''}`}>
        <div className="d-flex align-items-center justify-content-end w-100">
          <Button 
            variant="link" 
            className="hamburger-toggle"
            onClick={toggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaBars /> : <FaArrowLeft />}
          </Button>
        </div>
      </div>
      <Nav className={`flex-column`}>
        {navItems.map((item, index) => (
          <NavLink 
            key={index}
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'nav-link-collapsed' : ''}`}
            title={collapsed ? item.label : ''}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="nav-icon">
              {item.icon}
            </span>
            {!collapsed && <span className="nav-text slide-in">{item.label}</span>}
          </NavLink>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;