import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./employee.entity";

@Entity("tasks")
export class Task {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column({ type: "text" })
    description: string;

    @Column()
    assignedToId: string;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: "assignedToId" })
    assignedTo: Employee;

    @Column()
    assignedById: string;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: "assignedById" })
    assignedBy: Employee;

    @Column({
        type: "enum",
        enum: ["todo", "in_progress", "completed", "blocked"],
        default: "todo"
    })
    status: "todo" | "in_progress" | "completed" | "blocked";

    @Column({ type: "date" })
    dueDate: Date;

    @Column({
        type: "enum",
        enum: ["low", "medium", "high"],
        default: "medium"
    })
    priority: "low" | "medium" | "high";

    @Column({ nullable: true })
    completedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}