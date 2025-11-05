import { AppDataSource } from "../config/data-source";
import { Employee } from "../entities/employee.entity";
import { TimeCard } from "../entities/timecard.entity";
import { LeaveRequest } from "../entities/leave-request.entity";
import { Task } from "../entities/task.entity";
import * as bcrypt from "bcryptjs";

async function initializeDatabase() {
    try {
        // Initialize the database connection
        await AppDataSource.initialize();
        console.log("Database connection initialized");

        // Drop existing tables if they exist (only in development)
        if (process.env.NODE_ENV === "development") {
            await AppDataSource.dropDatabase();
            await AppDataSource.synchronize();
            console.log("Database schema synchronized");
        }

        // Create an admin user
        const adminPassword = await bcrypt.hash("admin123", 10);
        const adminUser = new Employee();
        adminUser.firstName = "Admin";
        adminUser.lastName = "User";
        adminUser.email = "admin@example.com";
        adminUser.password = adminPassword;
        adminUser.role = "admin";
        adminUser.department = "Management";
        adminUser.position = "System Administrator";

        await AppDataSource.manager.save(adminUser);
        console.log("Admin user created");

        // Create a sample employee
        const employeePassword = await bcrypt.hash("employee123", 10);
        const employee = new Employee();
        employee.firstName = "John";
        employee.lastName = "Doe";
        employee.email = "john.doe@example.com";
        employee.password = employeePassword;
        employee.role = "employee";
        employee.department = "Engineering";
        employee.position = "Software Engineer";

        await AppDataSource.manager.save(employee);
        console.log("Sample employee created");

        console.log("Database initialization completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error during database initialization:", error);
        process.exit(1);
    }
}

// Run the initialization
initializeDatabase();