import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Table, Button, Badge, Form, Modal, InputGroup } from 'react-bootstrap';
import { FaEdit, FaCalendarAlt, FaSyringe, FaUserGraduate, FaCheck, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import moment from 'moment';
import DriveService from '../services/drive.service';
import StudentService from '../services/student.service';
import EmptyState from '../components/EmptyState';

const VaccinationDriveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showVaccinateModal, setShowVaccinateModal] = useState(false);
  const [vaccinatingLoading, setVaccinatingLoading] = useState(false);

  useEffect(() => {
    fetchDrive();
  }, [id]);

  const fetchDrive = () => {
    setLoading(true);
    DriveService.get(id)
      .then(response => {
        setDrive(response.data);
        fetchEligibleStudents(response.data);
      })
      .catch(error => {
        console.error('Error fetching vaccination drive:', error);
        toast.error('Failed to load vaccination drive details');
        setLoading(false);
        navigate('/vaccination-drives');
      });
  };

  const fetchEligibleStudents = (driveData) => {
    // Get students in applicable grades
    const gradeFilter = driveData.applicableGrades && Array.isArray(driveData.applicableGrades) && driveData.applicableGrades.length > 0
      ? { grade: driveData.applicableGrades.join(',') }
      : {}; // If no grades specified, get all students
    
    StudentService.getAll(gradeFilter)
      .then(response => {
        // Filter out students who are already vaccinated in this drive
        const vaccinatedStudentIds = new Set(
          (driveData.vaccinations || []).map(v => v.studentId)
        );
        
        const eligibleStudents = response.data.filter(
          student => !vaccinatedStudentIds.has(student.id)
        );
        
        setStudents(eligibleStudents);
        setFilteredStudents(eligibleStudents);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching eligible students:', error);
        toast.error('Failed to load eligible students');
        setLoading(false);
      });
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        student => 
          (student.name && student.name.toLowerCase().includes(term.toLowerCase())) ||
          (student.studentId && student.studentId.toLowerCase().includes(term.toLowerCase())) ||
          (student.grade && student.grade.toString().includes(term))
      );
      setFilteredStudents(filtered);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleVaccinate = () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student to vaccinate');
      return;
    }

    setVaccinatingLoading(true);
    DriveService.recordVaccinations(id, { studentIds: selectedStudents })
      .then(response => {
        toast.success(response.data.message);
        setShowVaccinateModal(false);
        setSelectedStudents([]);
        fetchDrive(); // Refresh data
      })
      .catch(error => {
        console.error('Error recording vaccinations:', error);
        toast.error(error.response?.data?.message || 'Failed to record vaccinations');
      })
      .finally(() => {
        setVaccinatingLoading(false);
      });
  };

  const isPastDrive = () => {
    if (!drive) return false;
    const driveDate = new Date(drive.date);
    const today = new Date();
    return driveDate < today;
  };
  
  const canRecordVaccinations = () => {
    if (!drive) return false;
    
    // Can record if:
    // 1. There are remaining doses
    // 2. The drive date is today or in the past
    // 3. The drive is not cancelled
    
    const driveDate = new Date(drive.date);
    driveDate.setHours(0, 0, 0, 0); // Set to beginning of day
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day
    
    const remainingDoses = drive.availableDoses - (drive.vaccinatedCount || 0);
    
    return (
      remainingDoses > 0 && 
      driveDate <= today && 
      drive.status !== 'cancelled'
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <Badge bg="success">Completed</Badge>;
    } else if (status === 'cancelled') {
      return <Badge bg="danger">Cancelled</Badge>;
    } else if (isPastDrive()) {
      return <Badge bg="warning">Past Due</Badge>;
    } else {
      return <Badge bg="primary">Scheduled</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading vaccination drive details...</div>;
  }

  const remainingDoses = drive.availableDoses - (drive.vaccinatedCount || 0);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>{drive.name}</h1>
          <p className="text-muted">Vaccination Drive Details</p>
        </div>
        <div>
          <div className="d-flex">
            {!isPastDrive() && (
              <Link to={`/vaccination-drives/edit/${id}`} className="btn btn-primary me-2">
                <FaEdit className="me-2" /> Edit Drive
              </Link>
            )}
            {canRecordVaccinations() && (
              <Button variant="success" onClick={() => setShowVaccinateModal(true)}>
                <FaSyringe className="me-2" /> Record Vaccinations
              </Button>
            )}
          </div>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={8}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="m-0">Drive Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Vaccine:</strong> {drive.vaccineName}</p>
                  <p>
                    <strong>Date:</strong> <FaCalendarAlt className="me-1" /> 
                    {moment(drive.date).format('MMMM DD, YYYY')}
                  </p>
                  <p><strong>Status:</strong> {getStatusBadge(drive.status)}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Available Doses:</strong> {drive.availableDoses}</p>
                  <p><strong>Used Doses:</strong> {drive.vaccinatedCount || 0}</p>
                  <p><strong>Remaining Doses:</strong> {remainingDoses}</p>
                </Col>
              </Row>
              <p><strong>Applicable Grades:</strong> {drive.applicableGrades && Array.isArray(drive.applicableGrades) && drive.applicableGrades.length > 0 ? drive.applicableGrades.join(', ') : 'All Grades'}</p>
              {drive.description && (
                <div>
                  <strong>Description:</strong>
                  <p>{drive.description}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="m-0">Vaccination Summary</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="text-center mb-3">
                <div className="display-4">{drive.vaccinatedCount || 0}</div>
                <div className="text-muted">Students Vaccinated</div>
              </div>
              <div className="progress mb-3">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ 
                    width: `${drive.availableDoses > 0 
                      ? (drive.vaccinatedCount / drive.availableDoses) * 100 
                      : 0}%` 
                  }}
                  aria-valuenow={drive.vaccinatedCount} 
                  aria-valuemin="0" 
                  aria-valuemax={drive.availableDoses}
                ></div>
              </div>
              <div className="text-center text-muted">
                {remainingDoses > 0 
                  ? `${remainingDoses} doses remaining` 
                  : 'All doses used'}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="table-container">
        <Card.Header>
          <h5 className="m-0">Vaccinated Students</h5>
        </Card.Header>
        <Card.Body>
          {drive.vaccinations && drive.vaccinations.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Section</th>
                  <th>Vaccination Date</th>
                  <th>Administered By</th>
                </tr>
              </thead>
              <tbody>
                {drive.vaccinations.map(vaccination => (
                  <tr key={vaccination.id}>
                    <td>{vaccination.student.studentId}</td>
                    <td>{vaccination.student.name}</td>
                    <td>{vaccination.student.grade}</td>
                    <td>{vaccination.student.section}</td>
                    <td>{moment(vaccination.date).format('MMM DD, YYYY')}</td>
                    <td>{vaccination.administeredBy}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState 
              message="No students have been vaccinated in this drive yet" 
              icon={FaUserGraduate}
            />
          )}
        </Card.Body>
      </Card>

      {/* Vaccinate Modal */}
      <Modal 
        show={showVaccinateModal} 
        onHide={() => setShowVaccinateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Record Vaccinations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-info mb-3">
            <h5><FaSyringe className="me-2" /> Vaccination Information</h5>
            <p className="mb-1"><strong>Drive:</strong> {drive.name}</p>
            <p className="mb-1"><strong>Vaccine:</strong> {drive.vaccineName}</p>
            <p className="mb-1"><strong>Date:</strong> {moment(drive.date).format('MMMM DD, YYYY')}</p>
            <p className="mb-1"><strong>Remaining Doses:</strong> {remainingDoses}</p>
            <p className="mb-0 mt-2 small">
              Select the students who have received this vaccination. 
              Once recorded, vaccination records cannot be modified.
            </p>
          </div>

          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </Form.Group>

          {filteredStudents.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      />
                    </th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Section</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelect(student.id)}
                        />
                      </td>
                      <td>{student.studentId}</td>
                      <td>{student.name}</td>
                      <td>{student.grade}</td>
                      <td>{student.section}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="alert alert-warning">
              <FaUserGraduate className="me-2" />
              {searchTerm 
                ? "No students match your search" 
                : "No eligible students found for this vaccination drive"}
              <div className="mt-2 small">
                <strong>Possible reasons:</strong>
                <ul className="mb-0">
                  <li>No students are registered in the applicable grades</li>
                  <li>All eligible students have already been vaccinated</li>
                  <li>The drive might not have any applicable grades specified</li>
                </ul>
                <div className="mt-2">
                  Try <a href="/students/new" target="_blank">adding new students</a> or adjusting the drive's applicable grades.
                </div>
              </div>
            </div>
          )}

          {selectedStudents.length > 0 && (
            <div className="mt-3 alert alert-info">
              <FaCheck className="me-2" />
              {selectedStudents.length} students selected for vaccination
              {selectedStudents.length > remainingDoses && (
                <div className="text-danger mt-2">
                  Warning: You have selected more students than available doses!
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => {
                // Refresh the student list
                fetchEligibleStudents(drive);
                toast.info('Refreshing student list...');
              }}
            >
              Refresh Students
            </Button>
            
            <div>
              <Button variant="secondary" onClick={() => setShowVaccinateModal(false)} className="me-2">
                Cancel
              </Button>
              <Button 
                variant="success" 
                onClick={handleVaccinate} 
                disabled={
                  selectedStudents.length === 0 || 
                  selectedStudents.length > remainingDoses ||
                  vaccinatingLoading
                }
              >
                {vaccinatingLoading ? 'Recording...' : 'Record Vaccinations'}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VaccinationDriveDetails;