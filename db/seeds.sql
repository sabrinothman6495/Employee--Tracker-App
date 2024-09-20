INSERT INTO department (name) VALUES 
('HR'), 
('Engineering'), 
('Sales')
ON CONFLICT (name) DO NOTHING;

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES 
('HR Manager', 75000, 1),
('Engineer', 90000, 2),
('Salesperson', 60000, 3)
ON CONFLICT (title) DO NOTHING;

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Bill', 'Johnson', 3, 1);

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;