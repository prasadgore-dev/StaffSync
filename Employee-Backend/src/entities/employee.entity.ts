import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { TimeCard } from "./timecard.entity";
import { LeaveRequest } from "./leave-request.entity";
import { Task } from "./task.entity";

export type Role = "employee" | "admin" | "manager";

@Entity("employees")
export class Employee {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: "enum",
        enum: ["employee", "admin", "manager"],
        default: "employee"
    })
    role: "employee" | "admin" | "manager";

    @Column()
    department: string;

    @Column()
    position: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @OneToMany(() => TimeCard, timecard => timecard.employee)
    timecards: TimeCard[];

    @OneToMany(() => LeaveRequest, leaveRequest => leaveRequest.employee)
    leaveRequests: LeaveRequest[];

    @OneToMany(() => LeaveRequest, leaveRequest => leaveRequest.approvedBy)
    approvedLeaveRequests: LeaveRequest[];

    @OneToMany(() => Task, task => task.assignedTo)
    assignedTasks: Task[];

    @OneToMany(() => Task, task => task.assignedBy)
    tasksCreated: Task[];
}