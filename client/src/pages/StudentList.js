import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card, InputGroup, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaFileUpload, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import StudentService from '../services/student.service';
import DriveService from '../services/drive.service';
import EmptyState from '../components/EmptyState';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchGrade, setSearchGrade] = useState('');
  const [searchId, setSearchId] = useState('');
  const [vaccinationStatus, setVaccinationStatus] = useState('');
  const [vaccineId, setVaccineId] = useState('');
  const [drives, setDrives] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchDrives();
  }, []);

  const fetchStudents = (filters = {}) => {
    setLoading(true);
    StudentService.getAll({
      name: searchName || undefined,
      grade: searchGrade || undefined,
      studentId: searchId || undefined,
      vaccinationStatus: vaccinationStatus || undefined,
      vaccineId: vaccineId || undefined,
      ...filters
    })
      .then(response => {
        setStudents(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
        setLoading(false);
      });
  };

  const fetchDrives = () => {
    DriveService.getAll()
      .then(response => {
        setDrives(response.data);
      })
      .catch(error => {
        console.error('Error fetching drives:', error);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleReset = () => {
    setSearchName('');
    setSearchGrade('');
    setSearchId('');
    setVaccinationStatus('');
    setVaccineId('');
    fetchStudents({
      name: undefined,
      grade: undefined,
      studentId: undefined,
      vaccinationStatus: undefined,
      vaccineId: undefined
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadLoading(true);
    StudentService.bulkImport(formData)
      .then(response => {
        toast.success(response.data.message);
        setShowUploadModal(false);
        setFile(null);
        fetchStudents();
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        
        // Display detailed error information
        if (error.response?.data) {
          const errorData = error.response.data;
          
          // If there are specific validation errors, show them
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Show the main error message
            toast.error(errorData.message || 'Validation errors in CSV file');
            
            // Show the first few specific errors
            const errorsToShow = errorData.errors.slice(0, 3);
            errorsToShow.forEach(err => {
              toast.error(err, { delay: 300 });
            });
            
            // If there are more errors, show a count
            if (errorData.errors.length > 3) {
              toast.error(`...and ${errorData.errors.length - 3} more errors`, { delay: 600 });
            }
          } else if (errorData.example) {
            // If there's an example format provided, show it
            toast.error(errorData.message || 'Invalid CSV format');
            toast.info(`Example format: ${errorData.example}`, { delay: 300 });
          } else {
            // Just show the main error message
            toast.error(errorData.message || 'Failed to upload file');
          }
        } else {
          toast.error('Failed to upload file. Please check the file format.');
        }
      })
      .finally(() => {
        setUploadLoading(false);
      });
  };

  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!studentToDelete) return;

    StudentService.delete(studentToDelete.id)
      .then(response => {
        toast.success('Student deleted successfully');
        fetchStudents();
        setShowDeleteModal(false);
      })
      .catch(error => {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      });
  };

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>Students</h1>
          <p className="text-muted">Manage student records and vaccination status</p>
        </div>
        <div>
          <Button variant="primary" as={Link} to="/students/add" className="me-2">
            <FaPlus className="me-2" /> Add Student
          </Button>
          <Button variant="success" onClick={() => setShowUploadModal(true)}>
            <FaFileUpload className="me-2" /> Bulk Import
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Grade</Form.Label>
                  <Form.Control
                    as="select"
                    value={searchGrade}
                    onChange={(e) => setSearchGrade(e.target.value)}
                  >
                    <option value="">All Grades</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Student ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Vaccination Status</Form.Label>
                  <InputGroup>
                    <Form.Control
                      as="select"
                      value={vaccinationStatus}
                      onChange={(e) => setVaccinationStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="vaccinated">Vaccinated</option>
                      <option value="not-vaccinated">Not Vaccinated</option>
                    </Form.Control>
                    {vaccinationStatus && (
                      <Form.Control
                        as="select"
                        value={vaccineId}
                        onChange={(e) => setVaccineId(e.target.value)}
                        disabled={!vaccinationStatus}
                      >
                        <option value="">Select Vaccine</option>
                        {drives.map(drive => (
                          <option key={drive.id} value={drive.id}>
                            {drive.vaccineName} ({new Date(drive.date).toLocaleDateString()})
                          </option>
                        ))}
                      </Form.Control>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end mb-3">
                <Button type="submit" variant="primary" className="me-2">
                  <FaSearch className="me-1" /> Search
                </Button>
                <Button type="button" variant="secondary" onClick={handleReset}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="table-container">
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">Loading students...</div>
          ) : students.length > 0 ? (
            <Table responsive hover style={{ color: 'var(--text-color)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-100)' }}>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Section</th>
                  <th>Parent Name</th>
                  <th>Contact</th>
                  <th>Vaccination Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} style={{ color: 'var(--text-color)' }}>
                    <td>{student.studentId}</td>
                    <td>{student.name}</td>
                    <td>{student.grade}</td>
                    <td>{student.section}</td>
                    <td>{student.parentName}</td>
                    <td>{student.contactNumber}</td>
                    <td>
                      {student.vaccinations && student.vaccinations.length > 0 ? (
                        <span className="vaccination-status vaccinated">
                          Vaccinated ({student.vaccinations.length})
                        </span>
                      ) : (
                        <span className="vaccination-status not-vaccinated">
                          Not Vaccinated
                        </span>
                      )}
                    </td>
                    <td>
                      <Link to={`/students/edit/${student.id}`} className="btn btn-sm btn-outline-primary me-2">
                        <FaEdit />
                      </Link>
                      <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(student)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState message="No students found" />
          )}
        </Card.Body>
      </Card>

      {/* Bulk Import Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bulk Import Students</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Upload CSV File</Form.Label>
            <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
            <Form.Text className="text-muted">
              CSV file should have headers: studentId, name, dateOfBirth, gender, grade, section, parentName, contactNumber, address
            </Form.Text>
          </Form.Group>
          
          <div className="alert alert-info mt-3">
            <h6 className="mb-2">CSV Format Guidelines:</h6>
            <ol className="mb-2">
              <li>The file must be a valid CSV (comma-separated values) format</li>
              <li>The first row must contain column headers</li>
              <li>Required fields: <strong>studentId</strong>, <strong>name</strong>, and <strong>grade</strong></li>
              <li><strong>Date format must be DD-MM-YYYY</strong> (e.g., 21-07-1998) with hyphens as separators</li>
              <li>Gender should be "Male", "Female", or "Other"</li>
            </ol>
            <div className="mt-2">
              <strong>Example:</strong><br/>
              <code>studentId,name,dateOfBirth,gender,grade,section,parentName,contactNumber,address</code><br/>
              <code>ST001,Naveen Kumar,21-07-1998,Male,10,B,Ravu Singh,9876567809,123 Main Street</code>
            </div>
            <div className="mt-2 alert alert-warning">
              <strong>Important Date Format Note:</strong><br/>
              The date must be in DD-MM-YYYY format with hyphens (-) as separators.<br/>
              ✅ Correct: 21-07-1998 (day-month-year)<br/>
              ❌ Incorrect: 21/07/1998, 07-21-1998, 1998-07-21<br/>
              <strong>Note:</strong> If you're creating the CSV in Excel, make sure to format the date column as Text before entering dates.
            </div>
            <div className="mt-2">
              <a href="/sample_students.csv" download className="btn btn-sm btn-outline-primary">
                Download Sample CSV
              </a>
            </div>
          </div>
          
          {file && (
            <div className="alert alert-warning mt-3">
              <strong>Important:</strong> Make sure your CSV file has proper comma separators between each field.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload} disabled={!file || uploadLoading}>
            {uploadLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the student: <strong>{studentToDelete?.name}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StudentList;