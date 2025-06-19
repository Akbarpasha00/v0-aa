-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    course VARCHAR(100),
    year INTEGER,
    cgpa DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    location VARCHAR(255),
    website VARCHAR(255),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create placements table
CREATE TABLE IF NOT EXISTS placements (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    company_id INTEGER REFERENCES companies(id),
    position VARCHAR(255),
    package DECIMAL(10,2),
    placement_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO students (name, email, phone, course, year, cgpa) VALUES
('John Doe', 'john@example.com', '1234567890', 'Computer Science', 4, 8.5),
('Jane Smith', 'jane@example.com', '0987654321', 'Information Technology', 3, 9.0)
ON CONFLICT (email) DO NOTHING;

INSERT INTO companies (name, industry, location, contact_person, contact_email) VALUES
('Tech Corp', 'Technology', 'Bangalore', 'HR Manager', 'hr@techcorp.com'),
('Data Solutions', 'Analytics', 'Mumbai', 'Recruiter', 'jobs@datasolutions.com')
ON CONFLICT DO NOTHING;
