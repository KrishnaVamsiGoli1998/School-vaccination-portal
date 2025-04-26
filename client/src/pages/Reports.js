import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table } from 'react-bootstrap';
import { FaDownload, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import moment from 'moment';
import ReportService from '../services/report.service';
import DriveService from '../services/drive.service';
import EmptyState from '../components/EmptyState';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [drives, setDrives] = useState([]);
  const [filters, setFilters] = useState({
    driveId: '',
    vaccineName: '',
    startDate: '',
    endDate: '',
    grade: '',
    status: ''
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = () => {
    DriveService.getAll()
      .then(response => {
        setDrives(response.data);
      })
      .catch(error => {
        console.error('Error fetching drives:', error);
        toast.error('Failed to load vaccination drives');
      });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    
    // Filter out empty values
    const queryParams = Object.entries(filters)
      .reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {});
    
    ReportService.generateReport({
      ...queryParams,
      page: 1,
      limit: 10
    })
      .then(response => {
        setReport(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error generating report:', error);
        toast.error('Failed to generate report');
        setLoading(false);
      });
  };

  const handlePageChange = (newPage) => {
    setLoading(true);
    
    // Filter out empty values
    const queryParams = Object.entries(filters)
      .reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {});
    
    ReportService.generateReport({
      ...queryParams,
      page: newPage,
      limit: 10
    })
      .then(response => {
        setReport(response.data);
        setPage(newPage);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error changing page:', error);
        toast.error('Failed to load page');
        setLoading(false);
      });
  };

  const handleDownloadReport = () => {
    setDownloading(true);
    
    // Filter out empty values
    const queryParams = Object.entries(filters)
      .reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {});
    
    ReportService.downloadReport(queryParams)
      .then(() => {
        toast.success('Report downloaded successfully');
      })
      .catch(error => {
        console.error('Error downloading report:', error);
        toast.error('Failed to download report');
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  const handleReset = () => {
    setFilters({
      driveId: '',
      vaccineName: '',
      startDate: '',
      endDate: '',
      grade: '',
      status: ''
    });
    setReport(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Vaccination Reports</h1>
        <p className="text-muted">Generate and download vaccination reports</p>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="m-0"><FaFilter className="me-2" /> Report Filters</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleGenerateReport}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Vaccination Drive</Form.Label>
                  <Form.Control
                    as="select"
                    name="driveId"
                    value={filters.driveId}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Drives</option>
                    {drives.map(drive => (
                      <option key={drive.id} value={drive.id}>
                        {drive.name} ({moment(drive.date).format('MMM DD, YYYY')})
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Vaccine Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="vaccineName"
                    value={filters.vaccineName}
                    onChange={handleFilterChange}
                    placeholder="Filter by vaccine name"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Grade</Form.Label>
                  <Form.Control
                    as="select"
                    name="grade"
                    value={filters.grade}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Grades</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Vaccination Status</Form.Label>
                  <Form.Control
                    as="select"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Status</option>
                    <option value="vaccinated">Vaccinated</option>
                    <option value="not-vaccinated">Not Vaccinated</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleReset} className="me-2">
                Reset
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                <FaSearch className="me-2" />
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {report && (
        <Card className="table-container">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="m-0">Vaccination Report</h5>
            <Button 
              variant="success" 
              onClick={handleDownloadReport} 
              disabled={downloading || report.totalItems === 0}
            >
              <FaDownload className="me-2" />
              {downloading ? 'Downloading...' : 'Download CSV'}
            </Button>
          </Card.Header>
          <Card.Body>
            {report.totalItems > 0 ? (
              <>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Grade</th>
                      <th>Section</th>
                      <th>Vaccine</th>
                      <th>Vaccination Date</th>
                      <th>Drive</th>
                      <th>Administered By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.map((item, index) => (
                      <tr key={index}>
                        <td>{item.studentId}</td>
                        <td>{item.studentName}</td>
                        <td>{item.grade}</td>
                        <td>{item.section}</td>
                        <td>{item.vaccineName}</td>
                        <td>{moment(item.vaccinationDate).format('MMM DD, YYYY')}</td>
                        <td>{item.driveName}</td>
                        <td>{item.administeredBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Pagination */}
                {report.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <ul className="pagination">
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                        >
                          Previous
                        </button>
                      </li>
                      
                      {[...Array(report.totalPages).keys()].map(num => (
                        <li key={num + 1} className={`page-item ${page === num + 1 ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(num + 1)}
                          >
                            {num + 1}
                          </button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${page === report.totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === report.totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <EmptyState message="No data found for the selected filters" />
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Reports;