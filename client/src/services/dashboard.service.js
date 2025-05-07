import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/dashboard/';

class DashboardService {
  async getStats() {
    try {
      // Log the auth header for debugging (without exposing the actual token)
      const headers = authHeader();
      console.log('Auth header present:', !!headers.Authorization);
      
      // Add timeout to prevent hanging requests
      return await axios.get(API_URL + 'stats', { 
        headers: headers,
        timeout: 10000 // 10 seconds timeout
      });
    } catch (error) {
      console.error('Dashboard service error:', error.message);
      // Add more details to the error for better debugging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server');
      }
      throw error;
    }
  }
  
  // Get recent drives with retry mechanism
  async getRecentDrives(limit = 5) {
    let retries = 3;
    while (retries > 0) {
      try {
        return await axios.get(API_URL + 'recent-drives', { 
          headers: authHeader(),
          params: { limit },
          timeout: 5000
        });
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // Get upcoming drives with retry mechanism
  async getUpcomingDrives(limit = 5) {
    let retries = 3;
    while (retries > 0) {
      try {
        return await axios.get(API_URL + 'upcoming-drives', { 
          headers: authHeader(),
          params: { limit },
          timeout: 5000
        });
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

export default new DashboardService();