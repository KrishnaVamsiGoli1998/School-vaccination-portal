import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';
import VaccinationDriveList from './pages/VaccinationDriveList';
import VaccinationDriveForm from './pages/VaccinationDriveForm';
import VaccinationDriveDetails from './pages/VaccinationDriveDetails';
import Reports from './pages/Reports';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Services
import AuthService from './services/auth.service';

function App() {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage
    const user = AuthService.getCurrentUser();
    console.log('Current user from localStorage:', user);
    
    if (user && user.accessToken) {
      console.log('Valid user found with token');
      setCurrentUser(user);
    } else {
      console.log('No valid user found in localStorage');
      // Clear any invalid user data
      localStorage.removeItem('user');
    }
    
    setLoading(false);
    
    // Add event listener for storage changes (in case of login/logout in another tab)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Handle changes to localStorage (login/logout in other tabs)
  const handleStorageChange = (e) => {
    if (e.key === 'user') {
      if (e.newValue) {
        try {
          const user = JSON.parse(e.newValue);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error parsing user from storage event:', error);
        }
      } else {
        setCurrentUser(undefined);
      }
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/dashboard" />} />
        
        <Route element={<ProtectedRoute user={currentUser} />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/add" element={<StudentForm />} />
            <Route path="/students/edit/:id" element={<StudentForm />} />
            <Route path="/vaccination-drives" element={<VaccinationDriveList />} />
            <Route path="/vaccination-drives/add" element={<VaccinationDriveForm />} />
            <Route path="/vaccination-drives/edit/:id" element={<VaccinationDriveForm />} />
            <Route path="/vaccination-drives/:id" element={<VaccinationDriveDetails />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
        
        <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;