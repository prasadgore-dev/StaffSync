import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./employee.entity";

@Entity("leave_requests")
export class LeaveRequest {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    employeeId: string;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: "employeeId" })
    employee: Employee;

    @Column({ type: "date" })
    startDate: Date;

    @Column({ type: "date" })
    endDate: Date;

    @Column({
        type: "enum",
        enum: ["vacation", "sick", "personal", "other"],
        default: "vacation"
    })
    leaveType: "vacation" | "sick" | "personal" | "other";

    @Column({ type: "text" })
    reason: string;

    @Column({
        type: "enum",
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    })
    status: "pending" | "approved" | "rejected";

    @Column({ nullable: true })
    managerNotes: string;

    @Column({ nullable: true })
    approvedById: string;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: "approvedById" })
    approvedBy: Employee;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}