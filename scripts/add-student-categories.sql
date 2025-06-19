-- Add student categories and update students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General';
ALTER TABLE students ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS batch_year INTEGER;
ALTER TABLE students ADD COLUMN IF NOT EXISTS placement_status VARCHAR(50) DEFAULT 'Available';
ALTER TABLE students ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE students ADD COLUMN IF NOT EXISTS resume_url VARCHAR(255);

-- Create student categories table
CREATE TABLE IF NOT EXISTS student_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  eligibility_criteria JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO student_categories (name, description, eligibility_criteria) VALUES
('General', 'General category students', '{"min_cgpa": 6.0}'),
('SC', 'Scheduled Caste', '{"min_cgpa": 5.5}'),
('ST', 'Scheduled Tribe', '{"min_cgpa": 5.5}'),
('OBC', 'Other Backward Classes', '{"min_cgpa": 5.8}'),
('EWS', 'Economically Weaker Section', '{"min_cgpa": 6.0}'),
('PWD', 'Person with Disability', '{"min_cgpa": 5.0}');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_category ON students(category);
CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch);
CREATE INDEX IF NOT EXISTS idx_students_batch_year ON students(batch_year);
CREATE INDEX IF NOT EXISTS idx_students_placement_status ON students(placement_status);
