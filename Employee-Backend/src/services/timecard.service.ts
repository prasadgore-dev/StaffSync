import { AppDataSource } from '../config/data-source';
import { TimeCard } from '../entities/timecard.entity';
import { Between } from 'typeorm';

export class TimeCardService {
    private timecardRepository = AppDataSource.getRepository(TimeCard);

    async clockIn(employeeId: string): Promise<TimeCard> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already clocked in today
        const existingTimecard = await this.timecardRepository.findOne({
            where: {
                employeeId,
                date: today
            }
        });

        if (existingTimecard) {
            throw new Error('Already clocked in today');
        }

        const timecard = this.timecardRepository.create({
            employeeId,
            date: today,
            clockIn: new Date(),
            status: 'pending'
        });

        return this.timecardRepository.save(timecard);
    }

    async clockOut(employeeId: string): Promise<TimeCard> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const timecard = await this.timecardRepository.findOne({
            where: {
                employeeId,
                date: today
            }
        });

        if (!timecard) {
            throw new Error('No clock-in record found for today');
        }

        if (timecard.clockOut) {
            throw new Error('Already clocked out');
        }

        const clockOut = new Date();
        const totalHours = (clockOut.getTime() - timecard.clockIn.getTime()) / (1000 * 60 * 60);

        timecard.clockOut = clockOut;
        timecard.totalHours = Math.round(totalHours * 100) / 100; // Round to 2 decimal places

        return this.timecardRepository.save(timecard);
    }

    async getTimecards(
        startDate: Date,
        endDate: Date,
        employeeId?: string
    ): Promise<TimeCard[]> {
        const queryOptions: any = {
            where: {
                date: Between(startDate, endDate)
            },
            relations: ['employee'],
            order: {
                date: 'DESC',
                clockIn: 'DESC'
            }
        };

        if (employeeId) {
            queryOptions.where.employeeId = employeeId;
        }

        return this.timecardRepository.find(queryOptions);
    }

    async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<TimeCard> {
        const timecard = await this.timecardRepository.findOne({
            where: { id }
        });

        if (!timecard) {
            throw new Error('Timecard not found');
        }

        timecard.status = status;
        return this.timecardRepository.save(timecard);
    }

    async getTimecardsForPayroll(
        startDate: Date,
        endDate: Date,
        status: 'approved' | 'pending' | 'rejected' = 'approved'
    ): Promise<TimeCard[]> {
        return this.timecardRepository.find({
            where: {
                date: Between(startDate, endDate),
                status
            },
            relations: ['employee'],
            order: {
                employeeId: 'ASC',
                date: 'ASC'
            }
        });
    }
}