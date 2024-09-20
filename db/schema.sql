CREATE DATABASE employee_tracker_db;
\c employee_tracker_db

CREATE TABLE IF NOT EXISTS department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL UNIQUE,
    salary NUMERIC NOT NULL CHECK (salary > 0),
    department_id INTEGER REFERENCES department(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INTEGER REFERENCES role(id) ON DELETE SET NULL,
    manager_id INTEGER REFERENCES employee(id) ON DELETE SET NULL,
    CONSTRAINT chk_manager CHECK (manager_id IS NULL OR manager_id <> id)
);
