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

function startApp() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'Add an employee',
                'Add a role',
                'Add a department',
                'Exit'
            ]
        }
    ]).then((answers) => {
        switch (answers.action) {
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Exit':
                client.end();
                process.exit(0);
                break;
        }
    });
}

function viewEmployees() {
    const query = 'SELECT * FROM employee'; // Ensure the table name is correct
    client.query(query)
        .then((res) => {
            console.log(res.rows);
            startApp();
        })
        .catch((err) => {
            console.error('Error fetching employees:', err);
            startApp();
        });
}

function addEmployee() {
    inquirer.prompt([
        { type: 'input', name: 'first_name', message: 'Enter first name:' },
        { type: 'input', name: 'last_name', message: 'Enter last name:' },
        { type: 'input', name: 'role_id', message: 'Enter role ID:' },
        { type: 'input', name: 'manager_id', message: 'Enter manager ID (leave blank if none):' }
    ]).then((answers) => {
        const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)';
        const values = [answers.first_name, answers.last_name, answers.role_id, answers.manager_id || null];
        client.query(query, values)
            .then(() => {
                console.log('Employee added');
                startApp();
            })
            .catch((err) => {
                console.error('Error adding employee:', err);
                startApp();
            });
    });
}

function addRole() {
    console.log('Adding a role...');
    startApp();
}

function addDepartment() {
    inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter department name:' }
    ]).then((answers) => {
        const query = 'INSERT INTO department (name) VALUES ($1)';
        const values = [answers.name];
        client.query(query, values)
            .then(() => {
                console.log('Department added');
                startApp();
            })
            .catch((err) => {
                console.error('Error adding department:', err);
                startApp();
            });
    });
}

// Start the application
startApp();