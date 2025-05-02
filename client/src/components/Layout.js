import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AuthService from '../services/auth.service';

const Layout = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Check for theme preference
  useEffect(() => {
    const checkTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      setDarkMode(savedTheme === 'dark');
    };
    
    // Initial check
    checkTheme();
    
    // Listen for theme changes
    window.addEventListener('storage', checkTheme);
    
    // Also listen for theme attribute changes on body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setDarkMode(document.body.getAttribute('data-theme') === 'dark');
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    return () => {
      window.removeEventListener('storage', checkTheme);
      observer.disconnect();
    };
  }, []);
  
  // Check if sidebar state is saved in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  const handleLogout = () => {
    console.log('Layout: Logging out');
    // AuthService.logout already handles the redirect
    AuthService.logout();
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Determine background color based on theme
  const bgColor = darkMode ? '#0a0a0a' : '#f8f9fa';
  
  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div 
        className="content-wrapper"
        style={{
          width: sidebarCollapsed ? 'calc(100% - 70px)' : 'calc(100% - 250px)',
          marginLeft: sidebarCollapsed ? '70px' : '250px',
          backgroundColor: bgColor,
          transition: 'margin-left 0.3s ease, width 0.3s ease, background-color 0.3s ease'
        }}
      >
        <div 
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            left: sidebarCollapsed ? '70px' : '250px',
            width: sidebarCollapsed ? 'calc(100% - 70px)' : 'calc(100% - 250px)',
            zIndex: 999,
            transition: 'left 0.3s ease, width 0.3s ease, background-color 0.3s ease'
          }}
          className="navbar-container"
        >
          <Navbar onLogout={handleLogout} showTitle={sidebarCollapsed} />
        </div>
        <Container 
          fluid 
          className="main-content fade-in"
          style={{
            backgroundColor: bgColor,
            color: darkMode ? '#e9ecef' : '#212529',
            transition: 'background-color 0.3s ease, color 0.3s ease',
            borderTopLeftRadius: '20px',
            boxShadow: darkMode ? '0 5px 15px rgba(0, 0, 0, 0.2)' : '-5px 0 15px rgba(0, 0, 0, 0.03)'
          }}
        >
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;