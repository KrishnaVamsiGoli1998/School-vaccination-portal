# School Vaccination Portal API Documentation

## Overview

This document provides information about the API endpoints available in the School Vaccination Portal application. The API is built using Express.js and follows RESTful principles.

## API Base URL

For local development: `http://localhost:5000`

## Authentication

Most API endpoints require authentication using JWT (JSON Web Token). To authenticate, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

You can obtain a token by logging in through the `/api/auth/login` endpoint.

## Swagger Documentation

Interactive API documentation is available at `/api/docs` when the server is running. This provides a user-friendly interface to explore and test the API endpoints.

### Accessing Swagger Documentation

1. Make sure you have installed the required dependencies:
   ```bash
   npm install swagger-ui-express --save
   ```

2. You can check if Swagger is properly configured by running:
   ```bash
   npm run check-swagger
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

4. Open a browser and navigate to:
   ```
   http://localhost:5000/api/docs
   ```

5. Alternatively, you can access the documentation through:
   ```
   http://localhost:5000/api-docs
   ```

### Updating Swagger Documentation

The API documentation is defined in the `swagger.json` file in the root of the server directory. If you make changes to the API, you'll need to manually update this file to reflect the changes.

You can also view the raw Swagger specification by navigating to:
```
http://localhost:5000/api/docs/json
```

### Troubleshooting Swagger Documentation

If you encounter the "No operations defined in spec!" error:

1. Make sure the `swagger.json` file exists and is valid JSON
2. Check that the `paths` section in `swagger.json` contains API endpoint definitions
3. Verify that `swagger-ui-express` is properly installed
4. Restart the server after making any changes

You can run the following command to check if Swagger is properly configured:
```bash
npm run check-swagger
```

## Available Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/demo-login`: Demo login (for testing)

### Students

- `GET /api/students`: Get all students
- `GET /api/students/:id`: Get a student by ID
- `POST /api/students`: Create a new student
- `PUT /api/students/:id`: Update a student
- `DELETE /api/students/:id`: Delete a student
- `POST /api/students/bulk-import`: Bulk import students from CSV

### Vaccination Drives

- `GET /api/drives`: Get all vaccination drives
- `GET /api/drives/:id`: Get a vaccination drive by ID
- `POST /api/drives`: Create a new vaccination drive
- `PUT /api/drives/:id`: Update a vaccination drive
- `DELETE /api/drives/:id`: Delete a vaccination drive
- `POST /api/drives/:id/vaccinate`: Record vaccinations for students

### Dashboard

- `GET /api/dashboard/stats`: Get dashboard statistics

### Reports

- `GET /api/reports/generate`: Generate vaccination report

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: The request was successful
- `201 Created`: A new resource was successfully created
- `400 Bad Request`: The request was invalid or cannot be served
- `401 Unauthorized`: Authentication is required or failed
- `404 Not Found`: The requested resource does not exist
- `500 Internal Server Error`: An error occurred on the server

Error responses include a message field with details about the error:

```json
{
  "message": "Error message details"
}
```

## Data Models

### User

```json
{
  "id": 1,
  "username": "admin",
  "name": "School Coordinator",
  "role": "coordinator"
}
```

### Student

```json
{
  "id": 1,
  "studentId": "S12345",
  "name": "John Doe",
  "dateOfBirth": "2010-05-15",
  "gender": "Male",
  "grade": "Grade 5",
  "section": "A",
  "parentName": "Jane Doe",
  "contactNumber": "123-456-7890",
  "address": "123 Main St"
}
```

### Vaccination Drive

```json
{
  "id": 1,
  "name": "Annual Flu Vaccination",
  "vaccineName": "Influenza",
  "date": "2023-10-15",
  "availableDoses": 100,
  "applicableGrades": ["Grade 1", "Grade 2", "Grade 3"],
  "status": "scheduled",
  "description": "Annual flu vaccination drive"
}
```

### Vaccination

```json
{
  "id": 1,
  "studentId": 1,
  "driveId": 1,
  "date": "2023-10-15",
  "notes": "No adverse reactions",
  "administeredBy": "Dr. Smith"
}
```