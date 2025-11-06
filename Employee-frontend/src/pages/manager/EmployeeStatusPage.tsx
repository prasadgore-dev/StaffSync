import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { managerApi } from '../../services/api';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: 'clocked_in' | 'clocked_out';
  lastClockIn?: string;
  lastClockOut?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  dueDate: string;
}

interface Timecard {
  id: string;
  clockIn: string;
  clockOut?: string;
  totalHours: number;
  date: string;
}

interface EmployeeDetails extends Employee {
  tasks: Task[];
  timecards: Timecard[];
}

export const EmployeeStatusPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectEmployee = async (employeeId: string) => {
    try {
      setIsLoadingDetails(true);
      setError(null);
      
      const [details, tasks, timecards] = await Promise.all([
        managerApi.getEmployeeDetails(employeeId),
        managerApi.getEmployeeTasks(employeeId),
        managerApi.getEmployeeTimecards(
          employeeId,
          new Date().toISOString().split('T')[0], // Today
          new Date().toISOString().split('T')[0]
        )
      ]);

      setSelectedEmployee({
        ...details,
        tasks,
        timecards
      });
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError('Failed to load employee details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const data = await managerApi.getEmployeeStatuses();
        setEmployees(data);
      } catch (err) {
        console.error('Error fetching employee statuses:', err);
        setError('Failed to load employee statuses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchEmployees, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Status
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: selectedEmployee ? '2fr 3fr' : '1fr' }, gap: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Activity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow 
                  key={employee.id}
                  hover
                  onClick={() => handleSelectEmployee(employee.id)}
                  sx={{ cursor: 'pointer' }}
                  selected={selectedEmployee?.id === employee.id}
                >
                  <TableCell>
                    <Typography>
                      {employee.firstName} {employee.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {employee.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status === 'clocked_in' ? 'Working' : 'Out'}
                      color={employee.status === 'clocked_in' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {employee.status === 'clocked_in' && employee.lastClockIn
                      ? `Clocked in at ${new Date(employee.lastClockIn).toLocaleTimeString()}`
                      : employee.lastClockOut
                      ? `Clocked out at ${new Date(employee.lastClockOut).toLocaleTimeString()}`
                      : 'No activity today'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedEmployee && (
          <Box component={Paper} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5" gutterBottom>
              Employee Details: {selectedEmployee.firstName} {selectedEmployee.lastName}
            </Typography>

            {isLoadingDetails ? (
              <CircularProgress />
            ) : (
              <>
                <Box>
                  <Typography variant="h6" gutterBottom>Today's Timecard</Typography>
                  {selectedEmployee.timecards.length > 0 ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Clock In</TableCell>
                          <TableCell>Clock Out</TableCell>
                          <TableCell>Total Hours</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedEmployee.timecards.map((timecard) => (
                          <TableRow key={timecard.id}>
                            <TableCell>{new Date(timecard.clockIn).toLocaleTimeString()}</TableCell>
                            <TableCell>
                              {timecard.clockOut ? new Date(timecard.clockOut).toLocaleTimeString() : '-'}
                            </TableCell>
                            <TableCell>{timecard.totalHours.toFixed(2)}h</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography color="textSecondary">No timecard entries today</Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Tasks</Typography>
                  {selectedEmployee.tasks.length > 0 ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Task</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Due Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedEmployee.tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <Typography variant="body2">{task.title}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {task.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.status.replace('_', ' ')}
                                color={
                                  task.status === 'completed'
                                    ? 'success'
                                    : task.status === 'in_progress'
                                    ? 'primary'
                                    : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography color="textSecondary">No tasks assigned</Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};