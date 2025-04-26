import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import StudentService from '../services/student.service';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const isAddMode = !id;

  useEffect(() => {
    if (!isAddMode) {
      setLoading(true);
      StudentService.get(id)
        .then(response => {
          setStudent(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching student:', error);
          toast.error('Failed to load student details');
          setLoading(false);
          navigate('/students');
        });
    }
  }, [id, isAddMode, navigate]);

  const initialValues = {
    studentId: student?.studentId || '',
    name: student?.name || '',
    dateOfBirth: student?.dateOfBirth || '',
    gender: student?.gender || '',
    grade: student?.grade || '',
    section: student?.section || '',
    parentName: student?.parentName || '',
    contactNumber: student?.contactNumber || '',
    address: student?.address || ''
  };

  const validationSchema = Yup.object().shape({
    studentId: Yup.string().required('Student ID is required'),
    name: Yup.string().required('Name is required'),
    dateOfBirth: Yup.date().required('Date of Birth is required'),
    gender: Yup.string().required('Gender is required'),
    grade: Yup.string().required('Grade is required'),
    section: Yup.string().required('Section is required'),
    parentName: Yup.string().required('Parent Name is required'),
    contactNumber: Yup.string().required('Contact Number is required'),
    address: Yup.string()
  });

  const handleSubmit = (values, { setSubmitting }) => {
    if (isAddMode) {
      createStudent(values, setSubmitting);
    } else {
      updateStudent(values, setSubmitting);
    }
  };

  const createStudent = (values, setSubmitting) => {
    StudentService.create(values)
      .then(response => {
        toast.success('Student added successfully');
        navigate('/students');
      })
      .catch(error => {
        console.error('Error creating student:', error);
        toast.error(error.response?.data?.message || 'Failed to add student');
        setSubmitting(false);
      });
  };

  const updateStudent = (values, setSubmitting) => {
    StudentService.update(id, values)
      .then(response => {
        toast.success('Student updated successfully');
        navigate('/students');
      })
      .catch(error => {
        console.error('Error updating student:', error);
        toast.error(error.response?.data?.message || 'Failed to update student');
        setSubmitting(false);
      });
  };

  if (!isAddMode && loading) {
    return <div className="text-center my-5">Loading student details...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{isAddMode ? 'Add Student' : 'Edit Student'}</h1>
        <p className="text-muted">
          {isAddMode ? 'Create a new student record' : 'Update student information'}
        </p>
      </div>

      <Card className="form-container">
        <Card.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting
            }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Student ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="studentId"
                        value={values.studentId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.studentId && errors.studentId}
                        disabled={!isAddMode}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.studentId}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={values.dateOfBirth}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.dateOfBirth && errors.dateOfBirth}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dateOfBirth}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Control
                        as="select"
                        name="gender"
                        value={values.gender}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.gender && errors.gender}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Control>
                      <Form.Control.Feedback type="invalid">
                        {errors.gender}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Grade</Form.Label>
                      <Form.Control
                        as="select"
                        name="grade"
                        value={values.grade}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.grade && errors.grade}
                      >
                        <option value="">Select Grade</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                          <option key={grade} value={grade}>Grade {grade}</option>
                        ))}
                      </Form.Control>
                      <Form.Control.Feedback type="invalid">
                        {errors.grade}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Section</Form.Label>
                      <Form.Control
                        type="text"
                        name="section"
                        value={values.section}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.section && errors.section}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.section}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Parent Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="parentName"
                        value={values.parentName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.parentName && errors.parentName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.parentName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="contactNumber"
                        value={values.contactNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.contactNumber && errors.contactNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contactNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.address && errors.address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" as={Link} to="/students" className="me-2">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentForm;