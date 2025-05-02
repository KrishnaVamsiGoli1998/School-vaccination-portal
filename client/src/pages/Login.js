import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../services/auth.service';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  
  // Check for theme preference on component mount
  useEffect(() => {
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
    
    // Listen for theme changes
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        setDarkMode(e.newValue === 'dark');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const initialValues = {
    username: '',
    password: ''
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
  });

  const handleLogin = (formValue) => {
    const { username, password } = formValue;
    setMessage('');
    setLoading(true);

    AuthService.login(username, password)
      .then((data) => {
        // The AuthService already sets the user in localStorage
        // Force a page reload to ensure the app picks up the new auth state
        window.location.href = '/dashboard';
      })
      .catch(error => {
        console.error('Login error details:', error);
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setLoading(false);
        setMessage(resMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="login-container" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="login-image-section">
        <div className="login-overlay">
          <div className="login-image-content">
            <h1>School Vaccination Portal</h1>
            <p>Streamlining vaccination management for schools</p>
          </div>
        </div>
      </div>
      <div className="login-form-section">
        <div className="login-form">
          <h2 className="text-center mb-4" style={{ color: 'var(--text-color)' }}>Welcome Back</h2>
          <p className="text-center text-muted mb-4" style={{ color: 'var(--text-muted)' }}>Please sign in to continue</p>
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--text-color)' }}>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.username && errors.username}
                    placeholder="Enter your username"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-color)'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ color: 'var(--text-color)' }}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.password && errors.password}
                    placeholder="Enter your password"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-color)'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                {message && (
                  <Alert variant="danger" className="mb-3">
                    {message}
                  </Alert>
                )}

                <div className="text-center">
                  <Button variant="primary" type="submit" disabled={loading} className="w-100 py-2">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
                
                <div className="mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
                  <small>For demo: Username: admin, Password: Vax@Portal2025!</small>
                </div>
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => {
                      const newDarkMode = !darkMode;
                      setDarkMode(newDarkMode);
                      document.body.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
                      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
                    }}
                    style={{ 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;