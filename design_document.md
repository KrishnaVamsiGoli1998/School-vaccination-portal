# School Vaccination Portal - Design Document

## 1. Introduction

### 1.1 Purpose
The School Vaccination Portal is a comprehensive web application designed to streamline the management of vaccination records for schools. It provides a centralized platform for school administrators and health coordinators to track student vaccination status, schedule vaccination drives, record vaccinations, and generate reports.

### 1.2 Scope
This document outlines the architecture, design patterns, data models, and technical specifications of the School Vaccination Portal application. It serves as a reference for developers, stakeholders, and future maintainers of the system.

### 1.3 System Overview
The School Vaccination Portal is a full-stack web application built with:
- **Frontend**: React.js with React Bootstrap for UI components
- **Backend**: Node.js with Express.js for the API server
- **Database**: PostgreSQL for data storage
- **Authentication**: JWT (JSON Web Tokens) for secure user authentication

## 2. Architecture Overview

### 2.1 High-Level Architecture
The application follows a client-server architecture with a clear separation between the frontend and backend components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Client   │────▶│  Express API    │────▶│  PostgreSQL DB  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Component Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│ Client                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Components  │  │ Pages       │  │ Services    │             │
│  │ - Layout    │  │ - Dashboard │  │ - Auth      │             │
│  │ - Navbar    │  │ - Login     │  │ - Student   │             │
│  │ - Sidebar   │  │ - Students  │  │ - Drive     │             │
│  │ - StatsCard │  │ - Drives    │  │ - Report    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Server                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Routes      │  │ Controllers │  │ Models      │             │
│  │ - Auth      │  │ - Auth      │  │ - User      │             │
│  │ - Student   │  │ - Student   │  │ - Student   │             │
│  │ - Drive     │  │ - Drive     │  │ - Drive     │             │
│  │ - Report    │  │ - Report    │  │ - Vaccination│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Deployment Architecture
The application is containerized using Docker, with separate containers for:
- Frontend React application
- Backend Express API
- PostgreSQL database

Docker Compose is used to orchestrate these containers, making deployment and development consistent across environments.

## 3. Database Design

### 3.1 Entity Relationship Diagram (ERD)
```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│ User          │       │ Student       │       │ VaccinationDrive
│───────────────│       │───────────────│       │───────────────│
│ id            │       │ id            │       │ id            │
│ username      │       │ studentId     │       │ name          │
│ password      │       │ name          │       │ vaccineName   │
│ name          │       │ dateOfBirth   │       │ date          │
│ role          │       │ gender        │       │ availableDoses│
└───────────────┘       │ grade         │       │ applicableGrades
                        │ section       │       │ status        │
                        │ parentName    │       │ description   │
                        │ contactNumber │       └───────┬───────┘
                        │ address       │               │
                        └───────┬───────┘               │
                                │                       │
                                │                       │
                                ▼                       ▼
                        ┌───────────────────────────────────────┐
                        │ Vaccination                           │
                        │───────────────────────────────────────│
                        │ id                                    │
                        │ studentId (FK to Student)            │
                        │ driveId (FK to VaccinationDrive)     │
                        │ date                                  │
                        │ notes                                 │
                        │ administeredBy                        │
                        └───────────────────────────────────────┘
```

### 3.2 Data Models

#### 3.2.1 User Model
- **Purpose**: Stores user authentication and profile information
- **Fields**:
  - id (PK): Integer, auto-increment
  - username: String, unique
  - password: String (hashed)
  - name: String
  - role: String (default: 'coordinator')

#### 3.2.2 Student Model
- **Purpose**: Stores student information
- **Fields**:
  - id (PK): Integer, auto-increment
  - studentId: String, unique
  - name: String
  - dateOfBirth: Date
  - gender: String
  - grade: String
  - section: String
  - parentName: String
  - contactNumber: String
  - address: Text (optional)

#### 3.2.3 VaccinationDrive Model
- **Purpose**: Stores information about vaccination drives
- **Fields**:
  - id (PK): Integer, auto-increment
  - name: String
  - vaccineName: String
  - date: Date
  - availableDoses: Integer
  - applicableGrades: Array of Strings
  - status: Enum ('scheduled', 'completed', 'cancelled')
  - description: Text (optional)

#### 3.2.4 Vaccination Model
- **Purpose**: Records individual vaccinations
- **Fields**:
  - id (PK): Integer, auto-increment
  - studentId (FK): Integer, references Student.id
  - driveId (FK): Integer, references VaccinationDrive.id
  - date: Date
  - notes: Text (optional)
  - administeredBy: String (optional)

### 3.3 Relationships
- A Student can have multiple Vaccinations (one-to-many)
- A VaccinationDrive can have multiple Vaccinations (one-to-many)
- A Vaccination belongs to one Student and one VaccinationDrive (many-to-one)

## 4. Frontend Design

### 4.1 Component Structure
The frontend is organized into reusable components, pages, and services:

#### 4.1.1 Components
- **Layout**: Main layout wrapper with Sidebar and Navbar
- **Navbar**: Top navigation bar with user info and theme toggle
- **Sidebar**: Navigation menu for different sections
- **StatsCard**: Reusable card for displaying statistics
- **EmptyState**: Displayed when no data is available
- **ProtectedRoute**: Route wrapper for authentication

#### 4.1.2 Pages
- **Login**: User authentication page
- **Dashboard**: Overview with statistics and upcoming drives
- **StudentList**: List of all students with search and filter
- **StudentForm**: Form for adding/editing student records
- **VaccinationDriveList**: List of all vaccination drives
- **VaccinationDriveForm**: Form for adding/editing drives
- **VaccinationDriveDetails**: Details of a specific drive with vaccination recording
- **Reports**: Generate and download vaccination reports

#### 4.1.3 Services
- **auth.service.js**: Authentication API calls
- **student.service.js**: Student-related API calls
- **drive.service.js**: Vaccination drive API calls
- **report.service.js**: Report generation API calls
- **dashboard.service.js**: Dashboard statistics API calls

### 4.2 UI/UX Design
The application features a modern, responsive design with:
- Light and dark theme support
- Responsive layout for desktop and mobile devices
- Consistent styling using CSS variables for theming
- Interactive components with hover and focus states
- Form validation for data entry
- Toast notifications for user feedback

### 4.3 Routing Structure
```
/login                      - Login page
/dashboard                  - Dashboard overview
/students                   - Student list
/students/add               - Add new student
/students/edit/:id          - Edit existing student
/vaccination-drives         - Vaccination drive list
/vaccination-drives/add     - Add new vaccination drive
/vaccination-drives/edit/:id - Edit existing vaccination drive
/vaccination-drives/:id     - Vaccination drive details
/reports                    - Reports generation
```

## 5. Backend Design

### 5.1 API Structure
The backend follows a RESTful API design with the following endpoints:

#### 5.1.1 Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/demo-login`: Demo login (for testing)

#### 5.1.2 Students
- `GET /api/students`: Get all students
- `GET /api/students/:id`: Get a student by ID
- `POST /api/students`: Create a new student
- `PUT /api/students/:id`: Update a student
- `DELETE /api/students/:id`: Delete a student
- `POST /api/students/bulk-import`: Bulk import students from CSV

#### 5.1.3 Vaccination Drives
- `GET /api/drives`: Get all vaccination drives
- `GET /api/drives/:id`: Get a vaccination drive by ID
- `POST /api/drives`: Create a new vaccination drive
- `PUT /api/drives/:id`: Update a vaccination drive
- `DELETE /api/drives/:id`: Delete a vaccination drive
- `POST /api/drives/:id/vaccinate`: Record vaccinations for students

#### 5.1.4 Dashboard
- `GET /api/dashboard/stats`: Get dashboard statistics

#### 5.1.5 Reports
- `GET /api/reports/generate`: Generate vaccination report

### 5.2 Middleware
- **Authentication Middleware**: Validates JWT tokens for protected routes
- **Error Handling Middleware**: Centralized error handling
- **CORS Middleware**: Handles cross-origin requests

### 5.3 Controllers
Controllers handle the business logic for each API endpoint:
- **AuthController**: User authentication and registration
- **StudentController**: Student CRUD operations
- **DriveController**: Vaccination drive management
- **ReportController**: Report generation
- **DashboardController**: Dashboard statistics

## 6. Security Considerations

### 6.1 Authentication & Authorization
- JWT-based authentication with token expiration
- Password hashing using bcrypt
- Role-based access control (coordinator role)
- Protected routes requiring authentication

### 6.2 Data Security
- Input validation on both client and server
- Parameterized SQL queries via Sequelize ORM
- HTTPS for production deployment
- Environment variables for sensitive configuration

### 6.3 API Security
- CORS configuration to restrict access
- Rate limiting for API endpoints
- Validation of request payloads
- Secure HTTP headers

## 7. Deployment

### 7.1 Docker Configuration
The application is containerized using Docker with the following components:
- **PostgreSQL Container**: Database server
- **Node.js Container**: Backend API server
- **React Container**: Frontend application

### 7.2 Environment Configuration
Environment variables are used for configuration:
- Database connection details
- JWT secret key
- Server port
- API base URL

### 7.3 Deployment Options
- **Development**: Docker Compose for local development
- **Production**: Can be deployed to cloud platforms like AWS, Azure, or Heroku

## 8. Testing Strategy

### 8.1 Frontend Testing
- Unit tests for React components
- Integration tests for user flows
- End-to-end tests for critical paths

### 8.2 Backend Testing
- Unit tests for controllers and services
- API tests for endpoints
- Database integration tests

## 9. Future Enhancements

### 9.1 Potential Features
- Multi-language support
- Advanced reporting and analytics
- Parent portal for viewing child's vaccination status
- Email notifications for upcoming vaccination drives
- Mobile application for field vaccination recording

### 9.2 Technical Improvements
- Implement GraphQL for more efficient data fetching
- Add WebSocket for real-time updates
- Implement caching for improved performance
- Add comprehensive logging and monitoring

## 10. Conclusion

The School Vaccination Portal provides a robust solution for managing school vaccination programs. Its modular architecture, comprehensive data model, and user-friendly interface make it suitable for schools of various sizes. The application's design prioritizes security, usability, and maintainability, ensuring it can evolve to meet future requirements.