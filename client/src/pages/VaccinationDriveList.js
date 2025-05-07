import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Row, Col, Form, Modal } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import moment from 'moment';
import DriveService from '../services/drive.service';
import EmptyState from '../components/EmptyState';

const VaccinationDriveList = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driveToDelete, setDriveToDelete] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const location = useLocation();

  // Fetch drives when component mounts, filter changes, or when navigating back to this page
  useEffect(() => {
    fetchDrives();
  }, [filter, location.key]);
  
  // Also refresh data periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchDrives(false); // Silent refresh without loading indicator
      setLastRefresh(new Date());
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const fetchDrives = (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    const params = {};
    
    if (filter === 'upcoming') {
      params.upcoming = true;
    } else if (filter === 'past') {
      params.past = true;
    }
    

    
    DriveService.getAll(params)
      .then(response => {

        setDrives(response.data);
        if (showLoading) {
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching vaccination drives:', error);
        if (showLoading) {
          toast.error('Failed to load vaccination drives');
          setLoading(false);
        }
      });
  };

  const confirmDelete = (drive) => {
    setDriveToDelete(drive);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!driveToDelete) return;

    DriveService.delete(driveToDelete.id)
      .then(response => {
        toast.success('Vaccination drive deleted successfully');
        fetchDrives();
        setShowDeleteModal(false);
      })
      .catch(error => {
        console.error('Error deleting vaccination drive:', error);
        toast.error(error.response?.data?.message || 'Failed to delete vaccination drive');
      });
  };

  const getStatusBadge = (status, date) => {
    const driveDate = new Date(date);
    const today = new Date();
    
    if (status === 'completed') {
      return <Badge bg="success">Completed</Badge>;
    } else if (status === 'cancelled') {
      return <Badge bg="danger">Cancelled</Badge>;
    } else if (driveDate < today) {
      return <Badge bg="warning">Past Due</Badge>;
    } else {
      return <Badge bg="primary">Scheduled</Badge>;
    }
  };

  const isPastDrive = (date) => {
    const driveDate = new Date(date);
    const today = new Date();
    return driveDate < today;
  };

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>Vaccination Drives</h1>
          <p className="text-muted">Manage vaccination drives and schedules</p>
        </div>
        <Button variant="primary" as={Link} to="/vaccination-drives/add">
          <FaPlus className="me-2" /> Schedule New Drive
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter Drives</Form.Label>
                <Form.Control
                  as="select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Drives</option>
                  <option value="upcoming">Upcoming Drives</option>
                  <option value="past">Past Drives</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex justify-content-end align-items-end">
              <div>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => fetchDrives(true)}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  <FaSyncAlt className={loading ? "me-2 spin" : "me-2"} /> 
                  Refresh List
                </Button>
                <div className="text-muted small mt-1">
                  Last updated: {moment(lastRefresh).format('h:mm:ss A')}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="table-container">
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">Loading vaccination drives...</div>
          ) : drives.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vaccine</th>
                  <th>Date</th>
                  <th>Available Doses</th>
                  <th>Used Doses</th>
                  <th>Applicable Grades</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drives.map(drive => (
                  <tr key={drive.id}>
                    <td>{drive.name}</td>
                    <td>{drive.vaccineName}</td>
                    <td>
                      <FaCalendarAlt className="me-1" />
                      {moment(drive.date).format('MMM DD, YYYY')}
                    </td>
                    <td>{drive.availableDoses}</td>
                    <td>{drive.vaccinatedCount || 0}</td>
                    <td>
                      {drive.applicableGrades && Array.isArray(drive.applicableGrades) && drive.applicableGrades.length > 0 
                        ? drive.applicableGrades.join(', ') 
                        : 'All Grades'}
                    </td>
                    <td>{getStatusBadge(drive.status, drive.date)}</td>
                    <td>
                      <Link to={`/vaccination-drives/${drive.id}`} className="btn btn-sm btn-outline-info me-2">
                        <FaEye />
                      </Link>
                      {!isPastDrive(drive.date) && (
                        <Link to={`/vaccination-drives/edit/${drive.id}`} className="btn btn-sm btn-outline-primary me-2">
                          <FaEdit />
                        </Link>
                      )}
                      {!isPastDrive(drive.date) && drive.vaccinatedCount === 0 && (
                        <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(drive)}>
                          <FaTrash />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState 
              message={`No vaccination drives ${filter === 'upcoming' ? 'scheduled' : filter === 'past' ? 'in the past' : 'found'}`} 
              icon={FaCalendarAlt}
            />
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the vaccination drive: <strong>{driveToDelete?.name}</strong>?
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

export default VaccinationDriveList;