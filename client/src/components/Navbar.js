import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Button, Container } from 'react-bootstrap';
import { FaSignOutAlt, FaUser, FaBell, FaMoon, FaSun } from 'react-icons/fa';
import AuthService from '../services/auth.service';

const Navbar = ({ onLogout, showTitle = false }) => {
  const currentUser = AuthService.getCurrentUser();
  const [darkMode, setDarkMode] = useState(false);
  
  // Check for saved theme preference or system preference
  useEffect(() => {
    const checkTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setDarkMode(true);
        document.body.setAttribute('data-theme', 'dark');
      } else if (savedTheme === 'light') {
        setDarkMode(false);
        document.body.setAttribute('data-theme', 'light');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      }
    };
    
    // Initial check
    checkTheme();
    
    // Watch for theme attribute changes on body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const theme = document.body.getAttribute('data-theme');
          setDarkMode(theme === 'dark');
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Listen for custom theme change event
    const handleThemeChange = (event) => {
      setDarkMode(event.detail.theme === 'dark');
    };
    
    window.addEventListener('themechange', handleThemeChange);
    
    // Clean up
    return () => {
      observer.disconnect();
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Force a re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: newDarkMode ? 'dark' : 'light' } 
    }));
  };

  // Determine background color based on theme
  const navbarBgColor = darkMode ? '#000000' : '#ffffff';
  const textColor = darkMode ? '#e9ecef' : '#212529';

  return (
    <BootstrapNavbar 
      expand="lg" 
      className="app-navbar custom-theme-navbar"
      style={{
        backgroundColor: navbarBgColor,
        color: textColor,
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease'
      }}
      variant={darkMode ? "dark" : "light"}
      bg={darkMode ? "dark" : "light"}
    >
      <Container fluid className="px-4">
          <BootstrapNavbar.Brand className="d-none d-md-flex align-items-center">
            <div className="brand-logo me-2">
              <span className="brand-icon">V</span>
            </div>
            <span className="brand-text" style={{ color: textColor }}>School Vaccination Portal</span>
          </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            <div className="nav-item-icon me-3" style={{ 
                backgroundColor: darkMode ? '#ffffff' : '#f8f9fa',
                border: darkMode ? '1px solid #ffffff' : 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}>
              <FaBell className="nav-icon" style={{ color: darkMode ? '#000000' : '#6c757d' }} />
              <span className="notification-badge">2</span>
            </div>
            
            <div 
              className="nav-item-icon me-3 theme-toggle" 
              onClick={toggleTheme} 
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ 
                backgroundColor: darkMode ? '#ffffff' : '#f8f9fa',
                border: darkMode ? '1px solid #ffffff' : 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {darkMode ? 
                <FaSun className="nav-icon" style={{ color: '#000000' }} /> : 
                <FaMoon className="nav-icon" style={{ color: '#6c757d' }} />
              }
            </div>
            
            <div className="user-info me-4">
              <div className="user-avatar" style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: darkMode ? '#ffffff' : '#4361ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: darkMode ? '#000000' : '#ffffff',
                marginRight: '0.75rem',
                transition: 'all 0.2s ease'
              }}>
                <FaUser />
              </div>
              <div className="user-details">
                <span className="user-name" style={{ color: textColor }}>{currentUser?.name || 'School Coordinator'}</span>
                <span className="user-role" style={{ color: darkMode ? '#adb5bd' : '#6c757d' }}>Administrator</span>
              </div>
            </div>
            
            <Button 
              variant={darkMode ? "light" : "outline-primary"} 
              className="logout-btn" 
              onClick={onLogout}
              style={{
                color: darkMode ? '#000000' : '#4361ee',
                borderColor: darkMode ? '#ffffff' : '#4361ee',
                backgroundColor: darkMode ? '#ffffff' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </Button>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;