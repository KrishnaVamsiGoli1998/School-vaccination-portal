import axios from 'axios';

const API_URL = '/api/auth/';

class AuthService {
  login(username, password) {
    console.log('AuthService: Attempting login');
    return axios
      .post(API_URL + 'demo-login', {
        username,
        password
      })
      .then(response => {
        console.log('AuthService: Login response received:', response.data);
        
        if (response.data && response.data.accessToken) {
          console.log('AuthService: Valid token received, storing user');
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(response.data));
          
          // Dispatch a storage event to notify other tabs
          window.dispatchEvent(new Event('storage'));
          
          return response.data;
        } else {
          console.error('AuthService: No token in response');
          throw new Error('No access token received');
        }
      })
      .catch(error => {
        console.error('AuthService: Login error:', error);
        throw error;
      });
  }

  logout() {
    console.log('AuthService: Logging out');
    localStorage.removeItem('user');
    
    // Dispatch a storage event to notify other tabs
    window.dispatchEvent(new Event('storage'));
    
    // Redirect to login page
    window.location.href = '/login';
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      return null;
    }
  }
}

export default new AuthService();