export default function authHeader() {
  try {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      console.warn('No user found in localStorage');
      return {};
    }
    
    const user = JSON.parse(userStr);
    
    if (user && user.accessToken) {
      return { Authorization: 'Bearer ' + user.accessToken };
    } else {
      console.warn('User found in localStorage but no accessToken');
      return {};
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    // Clear the corrupted user data
    localStorage.removeItem('user');
    return {};
  }
}