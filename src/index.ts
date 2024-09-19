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
    .catch((err: any) => console.error('Connection error', err.stack));

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
    ]).then((answers: { action: string }) => {
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

// Placeholder functions for the actions
function viewEmployees() {
    console.log('Viewing all employees...');
    startApp();
}

function addEmployee() {
    console.log('Adding an employee...');
    startApp();
}

function addRole() {
    console.log('Adding a role...');
    startApp();
}

function addDepartment() {
    console.log('Adding a department...');
    startApp();
}

// Start the application
startApp();