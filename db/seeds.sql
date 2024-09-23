-- Insert departments
INSERT INTO department (name) VALUES 
\c employee_tracker_db

('HR'), 
('Engineering'), 
('Sales'),
('Legal'),
('Marketing'),
('Finance'),
('IT')
ON CONFLICT (name) DO NOTHING;

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES 
('HR Manager', 75000, 1),
('Engineer', 90000, 2),
('Salesperson', 60000, 3),
('Lawyer', 120000, 4),
('Marketing Manager', 80000, 5),
('Accountant', 70000, 6),
('IT Manager', 85000, 7)
ON CONFLICT (title) DO NOTHING;

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Bill', 'Johnson', 3, 1);
