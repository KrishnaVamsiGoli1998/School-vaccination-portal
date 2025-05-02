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
        toast.error(error.response?.data?.message || 'Failed to upload file');
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
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
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