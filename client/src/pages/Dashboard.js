import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaSyringe, FaPercentage, FaCalendarAlt } from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import moment from 'moment';
import DashboardService from '../services/dashboard.service';
import StatsCard from '../components/StatsCard';
import EmptyState from '../components/EmptyState';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching dashboard stats...');
      const response = await DashboardService.getStats();
      console.log('Dashboard data received:', response.status);
      
      if (response.data) {
        setStats(response.data);
      } else {
        setError('Received empty response from server');
        console.error('Empty response data');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Provide more specific error messages based on the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Authentication error. Please log in again.');
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Failed to load dashboard data: ${error.response.data.message || error.message}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to load dashboard data: ${error.message}`);
      }
      
      // Try to load partial data if available
      if (error.response && error.response.data) {
        const partialData = error.response.data;
        if (partialData.totalStudents !== undefined) {
          console.log('Using partial data from error response');
          setStats(partialData);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="alert alert-danger my-5">{error}</div>;
  }

  // Prepare data for vaccination by type chart
  const vaccinationTypeData = {
    labels: stats?.vaccinationsByType?.map(item => item.vaccineName) || [],
    datasets: [
      {
        data: stats?.vaccinationsByType?.map(item => item.count) || [],
        backgroundColor: [
          '#4e73df',
          '#1cc88a',
          '#36b9cc',
          '#f6c23e',
          '#e74a3b'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for recent drives chart
  const recentDrivesData = {
    labels: stats?.recentDrives?.map(drive => drive.name) || [],
    datasets: [
      {
        label: 'Vaccinations',
        data: stats?.recentDrives?.map(drive => drive.vaccinatedCount) || [],
        backgroundColor: '#4e73df',
      },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-description">Overview of vaccination status and upcoming drives</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <StatsCard 
            title="Total Students" 
            value={stats?.totalStudents || 0} 
            icon={FaUserGraduate} 
            color="#4e73df"
          />
        </Col>
        <Col md={3}>
          <StatsCard 
            title="Vaccinated Students" 
            value={stats?.vaccinatedStudentsCount || 0} 
            icon={FaSyringe} 
            color="#1cc88a"
          />
        </Col>
        <Col md={3}>
          <StatsCard 
            title="Vaccination Rate" 
            value={`${stats?.vaccinationPercentage || 0}%`} 
            icon={FaPercentage} 
            color="#f6c23e"
          />
        </Col>
        <Col md={3}>
          <StatsCard 
            title="Upcoming Drives" 
            value={stats?.upcomingDrives?.length || 0} 
            icon={FaCalendarAlt} 
            color="#e74a3b"
          />
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="chart-container h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
            <Card.Header style={{ backgroundColor: 'var(--gray-200)', borderBottomColor: 'var(--border-color)' }}>
              <h5 className="m-0">Vaccinations by Type</h5>
            </Card.Header>
            <Card.Body style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
              {stats?.vaccinationsByType?.length > 0 ? (
                <Pie data={vaccinationTypeData} options={{ responsive: true }} />
              ) : (
                <EmptyState message="No vaccination data available" />
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="chart-container h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
            <Card.Header style={{ backgroundColor: 'var(--gray-200)', borderBottomColor: 'var(--border-color)' }}>
              <h5 className="m-0">Recent Vaccination Drives</h5>
            </Card.Header>
            <Card.Body style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
              {stats?.recentDrives?.length > 0 ? (
                <Bar 
                  data={recentDrivesData} 
                  options={{ 
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }} 
                />
              ) : (
                <EmptyState message="No recent drives available" />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Drives */}
      <Row>
        <Col>
          <Card className="table-container" style={{ backgroundColor: 'var(--card-bg)' }}>
            <Card.Header className="d-flex justify-content-between align-items-center" 
                         style={{ backgroundColor: 'var(--gray-200)', borderBottomColor: 'var(--border-color)' }}>
              <h5 className="m-0">Upcoming Vaccination Drives</h5>
              <Link to="/vaccination-drives">
                <Button variant="outline-primary" size="sm">View All</Button>
              </Link>
            </Card.Header>
            <Card.Body style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
              {stats?.upcomingDrives?.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Vaccine</th>
                      <th>Date</th>
                      <th>Available Doses</th>
                      <th>Applicable Grades</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.upcomingDrives.map(drive => (
                      <tr key={drive.id}>
                        <td>{drive.name}</td>
                        <td>{drive.vaccineName}</td>
                        <td>{moment(drive.date).format('MMM DD, YYYY')}</td>
                        <td>{drive.availableDoses}</td>
                        <td>
                          {drive.applicableGrades && Array.isArray(drive.applicableGrades) && drive.applicableGrades.length > 0 
                            ? drive.applicableGrades.join(', ') 
                            : 'All Grades'}
                        </td>
                        <td>
                          <Link to={`/vaccination-drives/${drive.id}`}>
                            <Button variant="outline-info" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <EmptyState message="No upcoming vaccination drives" />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;