# School Vaccination Portal - Server

This is the backend server for the School Vaccination Portal application. It provides a RESTful API for managing student vaccination records, vaccination drives, and generating reports.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=vaccination_portal
   JWT_SECRET=your_jwt_secret
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

4. The server will be running at http://localhost:5000

## API Documentation

The API documentation is available at http://localhost:5000/api/docs when the server is running.

For detailed information about the API endpoints, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Features

- User authentication with JWT
- Student management
- Vaccination drive management
- Vaccination recording
- Report generation
- Dashboard statistics

## Project Structure

- `server.js` - Entry point of the application
- `models/` - Database models
- `routes/` - API routes
- `controllers/` - Business logic
- `config/` - Configuration files
- `uploads/` - Directory for uploaded files
- `swagger.json` - API documentation

## Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-reload
- `npm run check-swagger` - Check if Swagger documentation is properly configured