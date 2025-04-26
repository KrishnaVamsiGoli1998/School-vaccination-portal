import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/reports/';

class ReportService {
  generateReport(params = {}) {
    return axios.get(API_URL + 'generate', { 
      headers: authHeader(),
      params
    });
  }

  downloadReport(params = {}) {
    return axios.get(API_URL + 'generate', { 
      headers: authHeader(),
      params: {
        ...params,
        format: 'csv'
      },
      responseType: 'blob'
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vaccination_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }
}

export default new ReportService();