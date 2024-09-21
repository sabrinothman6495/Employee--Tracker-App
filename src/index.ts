import inquirer from 'inquirer';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    title: string;
    department_name: string;
    salary: number;
    manager_name: string | null;
}

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
    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View all employees',
                    'View all roles',
                    'View all departments',
                    'Add an employee',
                    'Add a role',
                    'Add a department',
                    `Update an employee's role`,
                    'Exit'
                ]
            }
        ]);

        switch (action) {
            case 'View all employees':
                await viewEmployees();
                break;
            case 'View all roles':
                await viewRoles();
                break;
            case 'View all departments':
                await viewDepartments();
                break;
            case 'Add an employee':
                await addEmployee();
                break;
            case 'Add a role':
                await addRole();
                break;
            case 'Add a department':
                await addDepartment();
                break;
            case `Update an employee's role`:
                await updateEmployeeRole();
                break;
            case 'Exit':
                await client.end();
                process.exit(0);
        }
    }
}

async function viewEmployees(): Promise<void> {
const query = `
        SELECT 
            e.id,
            e.first_name,
            e.last_name,
            r.title,
            d.name AS department_name,
            r.salary,
            CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM 
            employee e
        JOIN 
            role r ON e.role_id = r.id
        JOIN 
            department d ON r.department_id = d.id
        LEFT JOIN 
            employee m ON e.manager_id = m.id;
    `;

    try {
        const res = await client.query(query);
        console.table(res.rows);
    } catch (err) {
        console.error('Error fetching employees:', err);
    }

}

async function viewRoles(): Promise<void> {
    const query = `
        SELECT 
            r.id,
            r.title,
            r.salary,
            d.name AS department_name
        FROM 
            role r
        JOIN 
            department d ON r.department_id = d.id;
    `;

    try {
        const res = await client.query(query);
        console.table(res.rows);
    } catch (err) {
        console.error('Error fetching roles:', err);
    }
}

async function viewDepartments(): Promise<void> {
    const query = 'SELECT id, name FROM department;';
    
    try {
        const res = await client.query(query);
        console.table(res.rows);
    } catch (err) {
        console.error('Error fetching departments:', err);
    }
}

async function addEmployee(): Promise<void> {
    const roles = await client.query('SELECT id, title FROM role');
    const managers = await client.query('SELECT id, first_name, last_name FROM employee WHERE manager_id IS NULL');
    
    const { first_name, last_name, role, manager } = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter the employee\'s first name:'
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter the employee\'s last name:'
        },
        {
            type: 'list',
            name: 'role',
            message: 'Select the employee\'s role:',
            choices: roles.rows.map((role: { title: string }) => role.title)
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Select the employee\'s manager:',
            choices: [...managers.rows.map((manager: { first_name: string, last_name: string }) => `${manager.first_name} ${manager.last_name}`), 'None'],
        }
    ]);

    const roleId = (await client.query('SELECT id FROM role WHERE title = $1', [role])).rows[0].id;
    const managerId = manager === 'None' ? null : (await client.query('SELECT id FROM employee WHERE CONCAT(first_name, \' \', last_name) = $1', [manager])).rows[0].id;

    try {
        await client.query(
            `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4);`,
            [first_name, last_name, roleId, managerId]
        );
        console.log('Employee added successfully');
    } catch (err) {
        console.error('Error adding employee:', err);
    }
}

async function addRole(): Promise<void> {
    const departments = await client.query('SELECT id, name FROM department');
    
    const { title, salary, department } = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the role title:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the role salary:'
        },
        {
            type: 'list',
            name: 'department',
            message: 'Select the role department:',
            choices: departments.rows.map((department: { name: string }) => department.name)
        }
    ]);

    const departmentId = (await client.query('SELECT id FROM department WHERE name = $1', [department])).rows[0].id;

    try {
        await client.query(
            `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3);`,
            [title, salary, departmentId]
        );
        console.log('Role added successfully');
    } catch (err) {
        console.error('Error adding role:', err);
    }
}

async function addDepartment(): Promise<void> {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the department name:'
        }
    ]);

    try {
        await client.query(`INSERT INTO department (name) VALUES ($1);`, [name]);
        console.log('Department added successfully');
    } catch (err) {
        console.error('Error adding department:', err);
    }
}

async function updateEmployeeRole(): Promise<void> {
    const employees = await client.query('SELECT id, first_name, last_name FROM employee');
    const roles = await client.query('SELECT title FROM role');
    
    const { employee, role } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: 'Select the employee to update:',
            choices: employees.rows.map((employee: { first_name: string, last_name: string }) => `${employee.first_name} ${employee.last_name}`)
        },
        {
            type: 'list',
            name: 'role',
            message: 'Select the employee\'s new role:',
            choices: roles.rows.map((role: { title: string }) => role.title)
        }
    ]);

    const roleId = (await client.query('SELECT id FROM role WHERE title = $1', [role])).rows[0].id;
    const employeeId = (await client.query('SELECT id FROM employee WHERE CONCAT(first_name, \' \', last_name) = $1', [employee])).rows[0].id;

    try {
        await client.query(`UPDATE employee SET role_id = $1 WHERE id = $2;`, [roleId, employeeId]);
        console.log('Employee role updated successfully');
    } catch (err) {
        console.error('Error updating employee role:', err);
    }
}


// Start the application
startApp();
