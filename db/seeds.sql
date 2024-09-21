CREATE DATABASE employee_tracker_db;
INSERT INTO department (name) VALUES 
('HR'), 
('Engineering'), 
('Sales'),
('Legal'),
('Marketing'),
('Finance'),
('IT')
ON CONFLICT (name) DO NOTHING;

-- Insert roles
INSERT INTO role (title, salary, department_name) VALUES 
('HR Manager', 75000, 'HR'), 
('Engineer', 90000, 'Engineering'),
('Salesperson', 60000, 'Sales'),
('Lawyer', 120000, 'Legal'), 
('Marketing Manager', 80000, 'Marketing'),
('Accountant', 70000, 'Finance'),
('IT Manager', 85000, 'IT')
ON CONFLICT (title) DO NOTHING;

-- Insert employees
INSERT INTO employee (first_name, last_name, role_title, manager_name) VALUES 
('John', 'Doe', 'HR Manager', NULL), 
('Jane', 'Smith', 'Engineer', 'John Doe'),
('Alice', 'Johnson', 'Salesperson', 'John Doe'), 
('Bob', 'Brown', 'Lawyer', 'Jane Smith'), 
('Charlie', 'Davis', 'Marketing Manager', 'John Doe'),
('Eve', 'Williams', 'Accountant', 'John Doe'),
('Frank', 'Wilson', 'IT Manager', 'John Doe'),

Insert into viewEmployees (first_name, last_name, role_title, manager_name) VALUES 
('John', 'Doe', 'HR Manager', NULL), 
('Jane', 'Smith', 'Engineer', 'John Doe'),
('Alice', 'Johnson', 'Salesperson', 'John Doe'), 
('Bob', 'Brown', 'Lawyer', 'Jane Smith'), 
('Charlie', 'Davis', 'Marketing Manager', 'John Doe'),
('Eve', 'Williams', 'Accountant', 'John Doe'),
('Frank', 'Wilson', 'IT Manager', 'John Doe')

ON CONFLICT (first_name, last_name) DO NOTHING;
