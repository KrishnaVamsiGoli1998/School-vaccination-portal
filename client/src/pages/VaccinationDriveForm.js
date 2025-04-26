import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import moment from 'moment';
import DriveService from '../services/drive.service';

const VaccinationDriveForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(false);
  const isAddMode = !id;

  useEffect(() => {
    if (!isAddMode) {
      setLoading(true);
      DriveService.get(id)
        .then(response => {
          setDrive(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching vaccination drive:', error);
          toast.error('Failed to load vaccination drive details');
          setLoading(false);
          navigate('/vaccination-drives');
        });
    }
  }, [id, isAddMode, navigate]);

  // Check if drive is in the past
  const isPastDrive = () => {
    if (!drive) return false;
    const driveDate = new Date(drive.date);
    const today = new Date();
    return driveDate < today;
  };

  // Redirect if trying to edit a past drive
  useEffect(() => {
    if (!isAddMode && drive && isPastDrive()) {
      toast.error('Cannot edit past vaccination drives');
      navigate(`/vaccination-drives/${id}`);
    }
  }, [drive, id, isAddMode, navigate]);

  const initialValues = {
    name: drive?.name || '',
    vaccineName: drive?.vaccineName || '',
    date: drive?.date ? moment(drive.date).format('YYYY-MM-DD') : '',
    availableDoses: drive?.availableDoses || '',
    applicableGrades: drive?.applicableGrades || [],
    description: drive?.description || ''
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    vaccineName: Yup.string().required('Vaccine name is required'),
    date: Yup.date()
      .required('Date is required')
      .min(
        moment().add(15, 'days').format('YYYY-MM-DD'),
        'Vaccination drives must be scheduled at least 15 days in advance'
      ),
    availableDoses: Yup.number()
      .required('Available doses is required')
      .positive('Available doses must be positive')
      .integer('Available doses must be an integer'),
    applicableGrades: Yup.array()
      .min(1, 'At least one grade must be selected')
      .required('Applicable grades are required'),
    description: Yup.string()
  });

  const handleSubmit = (values, { setSubmitting }) => {
    // Convert applicableGrades to array if it's not already
    const formattedValues = {
      ...values,
      applicableGrades: Array.isArray(values.applicableGrades)
        ? values.applicableGrades
        : values.applicableGrades.split(',').map(grade => grade.trim())
    };

    if (isAddMode) {
      createDrive(formattedValues, setSubmitting);
    } else {
      updateDrive(formattedValues, setSubmitting);
    }
  };

  const createDrive = (values, setSubmitting) => {
    DriveService.create(values)
      .then(response => {
        toast.success('Vaccination drive scheduled successfully');
        navigate('/vaccination-drives');
      })
      .catch(error => {
        console.error('Error creating vaccination drive:', error);
        toast.error(error.response?.data?.message || 'Failed to schedule vaccination drive');
        setSubmitting(false);
      });
  };

  const updateDrive = (values, setSubmitting) => {
    DriveService.update(id, values)
      .then(response => {
        toast.success('Vaccination drive updated successfully');
        navigate('/vaccination-drives');
      })
      .catch(error => {
        console.error('Error updating vaccination drive:', error);
        toast.error(error.response?.data?.message || 'Failed to update vaccination drive');
        setSubmitting(false);
      });
  };

  if (!isAddMode && loading) {
    return <div className="text-center my-5">Loading vaccination drive details...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{isAddMode ? 'Schedule Vaccination Drive' : 'Edit Vaccination Drive'}</h1>
        <p className="text-muted">
          {isAddMode ? 'Create a new vaccination drive' : 'Update vaccination drive details'}
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
              isSubmitting,
              setFieldValue
            }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Drive Name</Form.Label>
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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vaccine Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="vaccineName"
                        value={values.vaccineName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.vaccineName && errors.vaccineName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.vaccineName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={values.date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.date && errors.date}
                        min={moment().add(15, 'days').format('YYYY-MM-DD')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.date}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Vaccination drives must be scheduled at least 15 days in advance.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Available Doses</Form.Label>
                      <Form.Control
                        type="number"
                        name="availableDoses"
                        value={values.availableDoses}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.availableDoses && errors.availableDoses}
                        min="1"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.availableDoses}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Applicable Grades</Form.Label>
                  <div className="d-flex flex-wrap">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                      <Form.Check
                        key={grade}
                        type="checkbox"
                        id={`grade-${grade}`}
                        label={`Grade ${grade}`}
                        className="me-3 mb-2"
                        checked={values.applicableGrades.includes(grade.toString())}
                        onChange={() => {
                          const currentGrades = [...values.applicableGrades];
                          const gradeStr = grade.toString();
                          
                          if (currentGrades.includes(gradeStr)) {
                            setFieldValue(
                              'applicableGrades',
                              currentGrades.filter(g => g !== gradeStr)
                            );
                          } else {
                            setFieldValue('applicableGrades', [...currentGrades, gradeStr]);
                          }
                        }}
                      />
                    ))}
                  </div>
                  {touched.applicableGrades && errors.applicableGrades && (
                    <div className="text-danger mt-1">{errors.applicableGrades}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.description && errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" as={Link} to="/vaccination-drives" className="me-2">
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

export default VaccinationDriveForm;