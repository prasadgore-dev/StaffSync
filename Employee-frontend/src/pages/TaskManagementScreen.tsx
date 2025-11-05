import { useState, useEffect } from 'react';
import './styles/TaskManagementScreen.scss';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { taskApi } from '../services/api';
import type { Task } from '../types/index';

export const TaskManagementScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    estimatedHours: '',
  });

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await taskApi.getTasks(selectedDate);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingTask) {
        // Update existing task
        await taskApi.updateTask(editingTask.id, {
          title: newTask.title,
          description: newTask.description,
          estimatedHours: newTask.estimatedHours ? Number(newTask.estimatedHours) : undefined,
        });
      } else {
        // Create new task
        await taskApi.createTask({
          title: newTask.title,
          description: newTask.description,
          estimatedHours: newTask.estimatedHours ? Number(newTask.estimatedHours) : undefined,
        });
      }
      setOpenDialog(false);
      setEditingTask(null);
      setNewTask({ title: '', description: '', estimatedHours: '' });
      await fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'ongoing' | 'completed') => {
    try {
      setIsLoading(true);
      await taskApi.updateTaskStatus(taskId, newStatus);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      estimatedHours: task.estimatedHours?.toString() || '',
    });
    setOpenDialog(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      setIsLoading(true);
      await taskApi.deleteTask(taskId);
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="task-management" sx={{ p: 3 }}>
      <Box className="task-management__header">
        <Typography variant="h4" className="task-management__header-title">Task Management</Typography>
        <Box className="task-management__header-controls">
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ width: 200 }}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTask(null);
              setNewTask({ title: '', description: '', estimatedHours: '' });
              setOpenDialog(true);
            }}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box className="task-management__loading">
          <CircularProgress />
        </Box>
      ) : (
        <Box className="task-management__tasks-grid">
          {tasks.length === 0 ? (
            <Card className="task-management__empty">
              <CardContent>
                <Typography align="center">No tasks for this date</Typography>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="task-management__task-card">
                <CardContent className="task-management__task-card-content">
                  <Box className="task-management__task-card-header">
                    <IconButton
                      onClick={() =>
                        handleStatusChange(
                          task.id,
                          task.status === 'completed' ? 'ongoing' : 'completed'
                        )
                      }
                      color={task.status === 'completed' ? 'success' : 'default'}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircleIcon />
                      ) : (
                        <RadioButtonUncheckedIcon />
                      )}
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box className="task-management__task-card-header">
                        <Typography variant="h6" className="task-management__task-card-title">
                          {task.title}
                        </Typography>
                        <Box className="task-management__task-card-actions">
                          <IconButton onClick={() => handleEditTask(task)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteTask(task.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      {task.description && (
                        <Typography className="task-management__task-card-description">
                          {task.description}
                        </Typography>
                      )}
                      <Box className="task-management__task-card-chips">
                        {task.estimatedHours && (
                          <Chip
                            label={`${task.estimatedHours} hour${
                              task.estimatedHours !== 1 ? 's' : ''
                            }`}
                            size="small"
                          />
                        )}
                        <Chip
                          label={task.status}
                          color={task.status === 'completed' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        <DialogContent>
          <Box className="task-management__dialog-form">
            <TextField
              label="Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Estimated Hours"
              type="number"
              value={newTask.estimatedHours}
              onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!newTask.title || isLoading}
          >
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};