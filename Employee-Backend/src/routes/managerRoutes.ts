import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { AppDataSource } from '../config/data-source';
import { Employee } from '../entities/employee.entity';
import { TimeCard } from '../entities/timecard.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { Task } from '../entities/task.entity';
import { Between, In, IsNull } from 'typeorm';
import type { AuthRequest } from '../types/auth.types';

const router = Router();

// Get all employee statuses (requires manager role)
router.get('/employee-statuses', authenticateToken, requireRole(['manager', 'admin'] as const), async (req: AuthRequest, res) => {
    try {
        const employees = await AppDataSource.getRepository(Employee).find({
            where: {
                role: In(['employee'])
            },
            select: ['id', 'firstName', 'lastName', 'email', 'department', 'position']
        });

        // Get today's timecards
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const timecards = await AppDataSource.getRepository(TimeCard).find({
            where: {
                date: Between(today, tomorrow),
                employeeId: In(employees.map(e => e.id))
            }
        });

        const employeeStatuses = employees.map(employee => {
            const timecard = timecards.find(t => t.employeeId === employee.id);
            return {
                ...employee,
                status: timecard && !timecard.clockOut ? 'clocked_in' : 'clocked_out',
                lastClockIn: timecard?.clockIn,
                lastClockOut: timecard?.clockOut
            };
        });

        res.json(employeeStatuses);
    } catch (error) {
        console.error('Error fetching employee statuses:', error);
        res.status(500).json({ message: 'Error fetching employee statuses' });
    }
});

// Get dashboard statistics (requires manager role)
router.get('/dashboard-stats', authenticateToken, requireRole(['manager', 'admin']), async (req: AuthRequest, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all stats in parallel
        const [totalEmployees, clockedInCount, pendingLeaveRequests, tasksInProgress] = await Promise.all([
            // Count total employees
            AppDataSource.getRepository(Employee).count({
                where: { role: 'employee' }
            }),
            // Count employees currently clocked in
            AppDataSource.getRepository(TimeCard)
                .createQueryBuilder('timecard')
                .where('timecard.date BETWEEN :today AND :tomorrow', { today, tomorrow })
                .andWhere('timecard.clockOut IS NULL')
                .getCount(),
            // Count pending leave requests
            AppDataSource.getRepository(LeaveRequest)
                .createQueryBuilder('leave')
                .where('leave.status = :status', { status: 'pending' })
                .getCount(),
            // Count tasks in progress
            AppDataSource.getRepository(Task)
                .createQueryBuilder('task')
                .where('task.status = :status', { status: 'in_progress' })
                .getCount()
        ]);

        const stats = {
            totalEmployees,
            clockedIn: clockedInCount,
            pendingLeaveRequests,
            tasksInProgress
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

export default router;