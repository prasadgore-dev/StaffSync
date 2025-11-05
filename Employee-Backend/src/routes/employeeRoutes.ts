import { Router } from 'express';
import { authenticateToken, requireRole, requireOwnershipOrAdmin, AuthRequest } from '../middleware/authMiddleware';
import { AppDataSource } from '../config/data-source';
import { Employee } from '../entities/employee.entity';

const router = Router();
const employeeRepository = AppDataSource.getRepository(Employee);

// Get all employees (admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        const employees = await employeeRepository.find({
            select: ['id', 'firstName', 'lastName', 'email', 'role', 'department', 'position', 'createdAt']
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees' });
    }
});

// Get employee by ID (admin or self)
router.get('/:id', authenticateToken, requireOwnershipOrAdmin(req => req.params.id), async (req, res) => {
    try {
        const employee = await employeeRepository.findOne({
            where: { id: req.params.id },
            select: ['id', 'firstName', 'lastName', 'email', 'role', 'department', 'position', 'createdAt']
        });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee' });
    }
});

// Update employee (admin or self)
router.put('/:id', authenticateToken, requireOwnershipOrAdmin(req => req.params.id), async (req: AuthRequest, res) => {
    try {
        const employee = await employeeRepository.findOne({ where: { id: req.params.id } });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Admin can update any field, employees can only update certain fields
        const allowedFields = (req.user as Employee).role === 'admin' 
            ? ['firstName', 'lastName', 'email', 'department', 'position', 'role']
            : ['firstName', 'lastName', 'email'];

        const updates = Object.keys(req.body)
            .filter(key => allowedFields.includes(key))
            .reduce((obj: any, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        await employeeRepository.update(req.params.id, updates);
        res.json({ message: 'Employee updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating employee' });
    }
});

export default router;