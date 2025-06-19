-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  course VARCHAR(100),
  year INTEGER,
  cgpa DECIMAL(3,2),
  skills TEXT[],
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(255),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  description TEXT,
  requirements TEXT,
  package_offered INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Placements table
CREATE TABLE placements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  position VARCHAR(255),
  package INTEGER,
  placement_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TPO (Training and Placement Officer) table
CREATE TABLE tpo_officers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  role VARCHAR(100) DEFAULT 'TPO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eligibility criteria table
CREATE TABLE eligibility_criteria (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  min_cgpa DECIMAL(3,2),
  allowed_courses TEXT[],
  min_year INTEGER,
  required_skills TEXT[],
  other_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp notifications table
CREATE TABLE whatsapp_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_course ON students(course);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_placements_student_id ON placements(student_id);
CREATE INDEX idx_placements_company_id ON placements(company_id);
CREATE INDEX idx_placements_status ON placements(status);

-- Insert sample data
INSERT INTO students (name, email, phone, course, year, cgpa, skills) VALUES
('John Doe', 'john.doe@example.com', '+1234567890', 'Computer Science', 4, 8.5, ARRAY['JavaScript', 'React', 'Node.js']),
('Jane Smith', 'jane.smith@example.com', '+1234567891', 'Information Technology', 3, 9.0, ARRAY['Python', 'Django', 'PostgreSQL']),
('Mike Johnson', 'mike.johnson@example.com', '+1234567892', 'Electronics', 4, 7.8, ARRAY['C++', 'Embedded Systems', 'IoT']);

INSERT INTO companies (name, industry, website, contact_person, contact_email, package_offered) VALUES
('TechCorp Inc', 'Technology', 'https://techcorp.com', 'Alice Brown', 'alice@techcorp.com', 1200000),
('DataSoft Solutions', 'Software', 'https://datasoft.com', 'Bob Wilson', 'bob@datasoft.com', 1000000),
('InnovateLab', 'Research', 'https://innovatelab.com', 'Carol Davis', 'carol@innovatelab.com', 1500000);

INSERT INTO tpo_officers (name, email, phone, department) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@college.edu', '+1234567893', 'Computer Science'),
('Prof. Michael Brown', 'michael.brown@college.edu', '+1234567894', 'Placement Office');
