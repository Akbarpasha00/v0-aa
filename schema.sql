-- Database schema for Cloudflare D1
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    course TEXT,
    year INTEGER,
    cgpa REAL,
    skills TEXT,
    resume_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT,
    location TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    requirements TEXT,
    package_offered TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    position TEXT,
    package TEXT,
    placement_date TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (company_id) REFERENCES companies (id)
);

CREATE TABLE IF NOT EXISTS job_postings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    package TEXT,
    location TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'open',
    created_at TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- Insert sample data
INSERT OR IGNORE INTO students (name, email, phone, course, year, cgpa, created_at) VALUES
('John Doe', 'john@example.com', '+1234567890', 'Computer Science', 4, 8.5, datetime('now')),
('Jane Smith', 'jane@example.com', '+1234567891', 'Information Technology', 4, 9.0, datetime('now')),
('Mike Johnson', 'mike@example.com', '+1234567892', 'Electronics', 3, 7.8, datetime('now'));

INSERT OR IGNORE INTO companies (name, industry, location, contact_email, requirements, package_offered, created_at) VALUES
('TechCorp', 'Technology', 'San Francisco', 'hr@techcorp.com', 'React, Node.js, Python', '$80,000', datetime('now')),
('DataSoft', 'Software', 'New York', 'careers@datasoft.com', 'Java, Spring, MySQL', '$75,000', datetime('now')),
('CloudTech', 'Cloud Services', 'Seattle', 'jobs@cloudtech.com', 'AWS, Docker, Kubernetes', '$90,000', datetime('now'));

INSERT OR IGNORE INTO placements (student_id, company_id, position, package, placement_date, status, created_at) VALUES
(1, 1, 'Frontend Developer', '$80,000', date('now'), 'confirmed', datetime('now')),
(2, 3, 'DevOps Engineer', '$90,000', date('now'), 'confirmed', datetime('now'));
