-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  course TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create placements table
CREATE TABLE IF NOT EXISTS placements (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  position TEXT NOT NULL,
  salary REAL,
  placement_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Insert sample data
INSERT OR IGNORE INTO students (id, name, email, course) VALUES
(1, 'John Doe', 'john@example.com', 'Computer Science'),
(2, 'Jane Smith', 'jane@example.com', 'Electronics'),
(3, 'Bob Johnson', 'bob@example.com', 'Mechanical');

INSERT OR IGNORE INTO companies (id, name, industry, contact_email) VALUES
(1, 'Tech Solutions', 'Technology', 'hr@techsolutions.com'),
(2, 'Global Systems', 'IT Services', 'careers@globalsystems.com'),
(3, 'Innovate Inc', 'Software', 'jobs@innovate.com');

INSERT OR IGNORE INTO placements (id, student_id, company_id, position, salary, placement_date) VALUES
(1, 1, 1, 'Software Engineer', 80000, '2023-06-15'),
(2, 2, 3, 'Frontend Developer', 75000, '2023-06-20'),
(3, 3, 2, 'Systems Analyst', 70000, '2023-07-01');
