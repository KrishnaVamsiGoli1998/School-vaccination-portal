import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AuthService from '../services/auth.service';

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar onLogout={handleLogout} />
        <Container fluid className="main-content">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;