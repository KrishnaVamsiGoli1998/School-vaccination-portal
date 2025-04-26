import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import AuthService from '../services/auth.service';

const Navbar = ({ onLogout }) => {
  const currentUser = AuthService.getCurrentUser();

  return (
    <BootstrapNavbar bg="white" expand="lg" className="border-bottom px-4 py-3">
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BootstrapNavbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <div className="d-flex align-items-center me-3">
            <FaUser className="me-2" />
            <span>{currentUser?.name || 'School Coordinator'}</span>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={onLogout}>
            <FaSignOutAlt className="me-2" />
            Logout
          </Button>
        </Nav>
      </BootstrapNavbar.Collapse>
    </BootstrapNavbar>
  );
};

export default Navbar;