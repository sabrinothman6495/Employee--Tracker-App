-- Drop tables if they exist to avoid errors
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS department;

\c employee_tracker_db

-- Create department table
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Create role table
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) UNIQUE NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department (id)
);

-- Create employee table
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INT REFERENCES role(id) ON DELETE SET NULL,
    manager_id INT REFERENCES employee(id) ON DELETE SET NULL
);

-- Sample query to retrieve combined data
SELECT 
    department.id AS department_id,
    department.name AS department_name,
    role.id AS role_id,
    role.title AS role_title,
    role.salary AS role_salary,
    employee.id AS employee_id,
    employee.first_name AS employee_first_name,
    employee.last_name AS employee_last_name,
    employee.manager_id AS employee_manager_id
FROM
    department
LEFT JOIN role ON department.id = role.department_id
LEFT JOIN employee ON role.id = employee.role_id;

