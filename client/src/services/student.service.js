import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/students/';

class StudentService {
  getAll(params = {}) {
    return axios.get(API_URL, { 
      headers: authHeader(),
      params
    });
  }

  get(id) {
    return axios.get(API_URL + id, { headers: authHeader() });
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

  bulkImport(formData) {
    return axios.post(API_URL + 'bulk-import', formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

export default new StudentService();