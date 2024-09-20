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
                `update an employee's role`,
                'Exit'
            ]
        }
    ]).then((answers) => {
        switch (answers.action) {
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add an employee':
                  startApp();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case `update an employee's role`:
                updateEmployeeRole();
                break;
            case 'Exit':
                client.end();
                process.exit(0);
                break;
        }
    });
}

async function viewEmployees() {
    const query = 'SELECT * FROM employee';
    try {
        const res = await client.query(query);
        console.table(res.rows); // Use console.table for better formatting
    } catch (err) {
        console.error('Error fetching employees:', err);
    } finally {
        startApp();
    }
}

async function addEmployee() {
    const answers = await inquirer.prompt([
      { name: 'first_name', message: 'Enter first name:' },
      { name: 'last_name', message: 'Enter last name:' },
      { name: 'role_id', message: 'Enter role ID:' },
      { name: 'manager_id', message: 'Enter manager ID (leave blank if none):' },
    ]);
  
    const roleId = parseInt(answers.role_id);
    const managerId = answers.manager_id ? parseInt(answers.manager_id) : null;
  
    if (isNaN(roleId) || (answers.manager_id !== '' && isNaN(managerId!))) {
      console.log('Role ID and Manager ID must be valid integers.');
      return addEmployee(); // Prompt the user again
    }
  
    try {
      await client.query(
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
        [answers.first_name, answers.last_name, roleId, managerId]
      );
      console.log('Employee added successfully');
    } catch (err) {
      console.error('Error adding employee:', err);
    }
  }
  
  addEmployee();


function addRole() {
    inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter role title:' },
        { type: 'input', name: 'salary', message: 'Enter role salary:' },
        { type: 'input', name: 'department_id', message: 'Enter department ID:' }
    ]).then((answers) => {
        const query = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)';
        const values = [answers.title, parseFloat(answers.salary), parseInt(answers.department_id)];
        
        client.query(query, values)
            .then(() => {
                console.log('Role added');
                startApp();
            })
            .catch((err) => {
                console.error('Error adding role:', err);
                startApp();
            });
    });
}

function addDepartment() {
    inquirer.prompt([
        { type: 'list', name: 'name', message: 'Enter department name:', choices: ['Engineering', 'Finance', 'Legal', 'Sales'] }
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

async function updateEmployeeRole() {
    const answers = await inquirer.prompt([
      { name: 'employee_id', message: 'Enter employee ID:' },
      { name: 'role_id', message: 'Enter new role ID:' },
    ]);
  
    const employeeId = parseInt(answers.employee_id);
    const roleId = parseInt(answers.role_id);
  
    if (isNaN(employeeId) || isNaN(roleId)) {
      console.log('Employee ID and Role ID must be valid integers.');
      return updateEmployeeRole(); // Prompt the user again
    }
  
    try {
      await client.query(
        'UPDATE employee SET role_id = $1 WHERE id = $2',
        [roleId, employeeId]
      );
      console.log('Employee role updated successfully');
    } catch (err) {
      console.error('Error updating employee role:', err);
    }
  }
  
  updateEmployeeRole();


// Start the application
startApp();
