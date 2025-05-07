import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/drives/';

class DriveService {
  getAll(params = {}) {
    return axios.get(API_URL, { 
      headers: {
        ...authHeader(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: {
        ...params,
        t: new Date().getTime() // Add timestamp to prevent caching
      }
    });
  }

  get(id) {
    return axios.get(API_URL + id, { 
      headers: {
        ...authHeader(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  }

  create(data) {
    return axios.post(API_URL, data, { headers: authHeader() });
  }

  update(id, data) {
    return axios.put(API_URL + id, data, { headers: authHeader() });
  }

  delete(id) {
    return axios.delete(API_URL + id, { headers: authHeader() });
  }

  recordVaccinations(driveId, data) {
    return axios.post(API_URL + driveId + '/vaccinate', data, { 
      headers: {
        ...authHeader(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  }
}

export default new DriveService();