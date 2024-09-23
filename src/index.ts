import inquirer from 'inquirer';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();


const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

client.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Connection error', err.stack));

    async function startApp() {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    `Update an employee's role`,
                    'Exit'
                ]
            }
        ]);
    
        switch (action) {
            case 'View all departments':
                await viewDepartments();
                break;
            case 'View all roles':
                await viewRoles();
                break;
            case 'View all employees':
                await viewEmployees();
                break;
            case 'Add a department':
                await addDepartment();
                break;
            case 'Add a role':
                await addRole();
                break;
            case 'Add an employee':
                await addEmployee();
                break;
            case `Update an employee's role`:
                await updateEmployeeRole();
                break;
            case 'Exit':
                client.end();
                process.exit(0);
                break;
        }
    
        startApp();
    }
    
    async function viewDepartments() {
        const res = await client.query('SELECT * FROM department');
        console.table(res.rows);
    }
    
    async function viewRoles() {
        const res = await client.query('SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id');
        console.table(res.rows);
    }
    
    async function viewEmployees() {
        const res = await client.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, manager.first_name AS manager_first_name, manager.last_name AS manager_last_name FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id');
        console.table(res.rows);
    }
    
    async function addDepartment() {
        const { name } = await inquirer.prompt([
            { type: 'input', name: 'name', message: 'Enter department name:' }
        ]);
    
        await client.query('INSERT INTO department (name) VALUES ($1)', [name]);
        console.log('Department added successfully');
    }
    
    async function addRole() {
        const departments = await client.query('SELECT id, name FROM department');
        const departmentChoices = departments.rows.map(dept => ({ name: dept.name, value: dept.id }));
    
        const answers = await inquirer.prompt([
            { type: 'input', name: 'title', message: 'Enter role title:' },
            { type: 'input', name: 'salary', message: 'Enter role salary:' },
            { type: 'list', name: 'department_id', message: 'Select department:', choices: departmentChoices }
        ]);
    
        await client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answers.title, answers.salary, answers.department_id]);
        console.log('Role added successfully');
    }
    
    async function addEmployee() {
        const roles = await client.query('SELECT id, title FROM role');
        const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));
    
        const employees = await client.query('SELECT id, first_name, last_name FROM employee');
        const managerChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
        managerChoices.unshift({ name: 'None', value: null });
    
        const answers = await inquirer.prompt([
            { type: 'input', name: 'first_name', message: 'Enter first name:' },
            { type: 'input', name: 'last_name', message: 'Enter last name:' },
            { type: 'list', name: 'role_id', message: 'Select role:', choices: roleChoices },
            { type: 'list', name: 'manager_id', message: 'Select manager:', choices: managerChoices }
        ]);
    
        await client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]);
        console.log('Employee added successfully');
    }
    
    async function updateEmployeeRole() {
        const employees = await client.query('SELECT id, first_name, last_name FROM employee');
        const employeeChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
    
        const roles = await client.query('SELECT id, title FROM role');
        const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));
    
        const answers = await inquirer.prompt([
            { type: 'list', name: 'employee_id', message: 'Select employee:', choices: employeeChoices },
            { type: 'list', name: 'role_id', message: 'Select new role:', choices: roleChoices }
        ]);
    
        await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answers.role_id, answers.employee_id]);
        console.log('Employee role updated successfully');
    }
    
    startApp();
