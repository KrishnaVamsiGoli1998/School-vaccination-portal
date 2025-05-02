-- Database setup script for School Vaccination Portal

-- Create database (run this separately if needed)
-- CREATE DATABASE vaccination_portal;

-- Connect to the database
-- \c vaccination_portal;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'coordinator',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  "studentId" VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  "dateOfBirth" DATE NOT NULL,
  gender VARCHAR(50) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  section VARCHAR(50) NOT NULL,
  "parentName" VARCHAR(255) NOT NULL,
  "contactNumber" VARCHAR(50) NOT NULL,
  address TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create vaccination_drives table
CREATE TABLE IF NOT EXISTS "vaccinationDrives" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "vaccineName" VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  "availableDoses" INTEGER NOT NULL,
  "applicableGrades" VARCHAR(255)[] NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  description TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
  id SERIAL PRIMARY KEY,
  "studentId" INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  "driveId" INTEGER NOT NULL REFERENCES "vaccinationDrives"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  notes TEXT,
  "administeredBy" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_students_grade ON students(grade);
CREATE INDEX idx_vaccination_drives_date ON "vaccinationDrives"(date);
CREATE INDEX idx_vaccinations_student_id ON vaccinations("studentId");
CREATE INDEX idx_vaccinations_drive_id ON vaccinations("driveId");

-- Insert demo admin user (password: Vax@Portal2025!)
INSERT INTO users (username, password, name, role)
VALUES ('admin', '$2a$10$XFE0rQyZ5GfZmZuiYuV.guYgEX6.m0n/9IdpdYCOjJfK1.IpRYFLC', 'School Coordinator', 'coordinator')
ON CONFLICT (username) DO NOTHING;

-- Insert sample data for testing

-- Sample students
INSERT INTO students ("studentId", name, "dateOfBirth", gender, grade, section, "parentName", "contactNumber", address)
VALUES 
  ('S001', 'John Smith', '2010-05-15', 'Male', '5', 'A', 'Mary Smith', '555-1234', '123 Main St'),
  ('S002', 'Emma Johnson', '2011-08-22', 'Female', '4', 'B', 'Robert Johnson', '555-2345', '456 Oak Ave'),
  ('S003', 'Michael Brown', '2009-03-10', 'Male', '6', 'A', 'Jennifer Brown', '555-3456', '789 Pine Rd'),
  ('S004', 'Sophia Davis', '2012-11-30', 'Female', '3', 'C', 'William Davis', '555-4567', '321 Elm St'),
  ('S005', 'James Wilson', '2010-07-18', 'Male', '5', 'B', 'Patricia Wilson', '555-5678', '654 Maple Dr')
ON CONFLICT ("studentId") DO NOTHING;

-- Sample vaccination drives
INSERT INTO "vaccinationDrives" (name, "vaccineName", date, "availableDoses", "applicableGrades", status, description)
VALUES 
  ('Annual Flu Vaccination', 'Influenza Vaccine', CURRENT_DATE + INTERVAL '30 days', 100, ARRAY['1', '2', '3', '4', '5'], 'scheduled', 'Annual flu vaccination for primary grades'),
  ('MMR Booster', 'MMR Vaccine', CURRENT_DATE + INTERVAL '45 days', 50, ARRAY['6', '7', '8'], 'scheduled', 'Measles, Mumps, and Rubella booster for middle grades'),
  ('Hepatitis B Drive', 'Hepatitis B Vaccine', CURRENT_DATE - INTERVAL '15 days', 75, ARRAY['9', '10', '11', '12'], 'completed', 'Hepatitis B vaccination for high school students')
ON CONFLICT DO NOTHING;

-- Sample vaccinations (for the completed drive)
INSERT INTO vaccinations ("studentId", "driveId", date, "administeredBy")
SELECT 
  s.id, 
  d.id, 
  d.date, 
  'School Nurse'
FROM 
  students s, 
  "vaccinationDrives" d
WHERE 
  d.name = 'Hepatitis B Drive' AND
  s."studentId" IN ('S003', 'S005')
ON CONFLICT DO NOTHING;