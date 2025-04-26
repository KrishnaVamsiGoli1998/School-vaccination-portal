# School Vaccination Portal

A full-stack web application for managing school vaccination records, drives, and reports.

## Features

- **Dashboard**: Overview of vaccination statistics and upcoming drives
- **Student Management**: Add, edit, and manage student records
- **Vaccination Drives**: Schedule and manage vaccination drives
- **Vaccination Recording**: Record vaccinations for students
- **Reports**: Generate and download vaccination reports

## Tech Stack

- **Frontend**: React, React Bootstrap, Chart.js, Formik
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd school-vaccination-portal
```

### 2. Configure the database

- The application will automatically create the database if it doesn't exist
- Update the database configuration in `/server/.env` if needed

### 3. Install server dependencies

```bash
cd server
npm install
```

### 4. Set up environment variables

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=vaccination_portal
JWT_SECRET=your_jwt_secret
```

### 5. Install client dependencies

```bash
cd ../client
npm install
```

## Running the Application

### 1. Start the server

```bash
cd server
npm run dev
```

The server will run on http://localhost:5000

### 2. Start the client

```bash
cd client
npm start
```

The client will run on http://localhost:3000

## API Documentation

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

## Demo Credentials

For testing purposes, you can use the following credentials:

- **Username**: admin
- **Password**: admin123

## Project Structure

```
school-vaccination-portal/
├── client/                 # React frontend
│   ├── public/             # Public assets
│   └── src/                # Source files
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── utils/          # Utility functions
│
└── server/                 # Node.js backend
    ├── config/             # Configuration files
    ├── controllers/        # Request controllers
    ├── middleware/         # Express middleware
    ├── models/             # Database models
    └── routes/             # API routes
```

## License

This project is licensed under the MIT License.