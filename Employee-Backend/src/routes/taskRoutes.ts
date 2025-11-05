import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole, requireOwnershipOrAdmin, AuthRequest } from '../middleware/authMiddleware';
import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/task.entity';
import { body, validationResult } from 'express-validator';

const router = Router();
const taskRepository = AppDataSource.getRepository(Task);

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for task
const taskValidation = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('assignedToId').notEmpty().withMessage('Assignee is required'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('dueDate').isDate().withMessage('Due date is required')
];

// Create task (admin only)
router.post('/', authenticateToken, requireRole('admin'), taskValidation, validateRequest, async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, assignedToId, priority, dueDate } = req.body;

        const task = taskRepository.create({
            title,
            description,
            assignedToId,
            assignedById: req.user!.id,
            priority,
            dueDate: new Date(dueDate),
            status: 'todo'
        });

        await taskRepository.save(task);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task' });
    }
});

// Get tasks (admin sees all, employees see assigned tasks)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { status, priority, dueDate } = req.query;
        const queryOptions: any = {
            where: {},
            relations: ['assignedTo', 'assignedBy'],
            order: {
                dueDate: 'ASC',
                createdAt: 'DESC'
            }
        };

        // Apply filters
        if (status && ['todo', 'in_progress', 'completed', 'blocked'].includes(status as string)) {
            queryOptions.where.status = status;
        }
        if (priority && ['low', 'medium', 'high'].includes(priority as string)) {
            queryOptions.where.priority = priority;
        }
        if (dueDate) {
            const date = new Date(dueDate as string);
            date.setHours(23, 59, 59, 999);
            queryOptions.where.dueDate = date;
        }

        // If not admin, only show assigned tasks
        if (req.user!.role !== 'admin') {
            queryOptions.where.assignedToId = req.user!.id;
        }

        const tasks = await taskRepository.find(queryOptions);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});

// Get single task
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const task = await taskRepository.findOne({
            where: { id: req.params.id },
            relations: ['assignedTo', 'assignedBy']
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user has access to this task
        if (req.user!.role !== 'admin' && task.assignedToId !== req.user!.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching task' });
    }
});

// Update task status (assignee or admin)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        if (!['todo', 'in_progress', 'completed', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const task = await taskRepository.findOne({
            where: { id: req.params.id }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user can update this task
        if (req.user!.role !== 'admin' && task.assignedToId !== req.user!.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        task.status = status;
        if (status === 'completed') {
            task.completedAt = new Date();
        }

        await taskRepository.save(task);
        res.json({ message: 'Task status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating task status' });
    }
});

// Update task (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), taskValidation, validateRequest, async (req: AuthRequest, res: Response) => {
    try {
        const task = await taskRepository.findOne({
            where: { id: req.params.id }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const updates = {
            ...req.body,
            dueDate: new Date(req.body.dueDate)
        };

        await taskRepository.update(req.params.id, updates);
        res.json({ message: 'Task updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating task' });
    }
});

// Delete task (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        const task = await taskRepository.findOne({
            where: { id: req.params.id }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await taskRepository.remove(task);
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});

export default router;