import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/dashboard/';

class DashboardService {
  getStats() {
    return axios.get(API_URL + 'stats', { headers: authHeader() });
  }
}

export default new DashboardService();