import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../services/api';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
}

interface DepartmentStats {
  name: string;
  count: number;
}

interface EmployeeStats {
  totalEmployees: number;
  departmentStats: DepartmentStats[];
  pendingLeaveRequests: number;
}

export const ManagerDashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats>({
    totalEmployees: 0,
    departmentStats: [],
    pendingLeaveRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [employeesData, statsData] = await Promise.all([
        managerApi.getEmployeeStatuses(),
        managerApi.getDashboardStats(),
      ]);
      setEmployees(employeesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDetails = (employeeId: string) => {
    navigate(`/employee-status/${employeeId}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        Manager Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              Total Employees
            </Typography>
            <Typography variant="h4">{stats.totalEmployees}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              Pending Leave Requests
            </Typography>
            <Typography variant="h4">{stats.pendingLeaveRequests}</Typography>
          </CardContent>
        </Card>
      </Box>
      
      {/* Department Statistics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Department Statistics
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fill, minmax(200px, 1fr))' }, gap: 3 }}>
          {stats.departmentStats.map((dept) => (
            <Card key={dept.name}>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  {dept.name}
                </Typography>
                <Typography variant="h4">{dept.count}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <Typography variant="body1">
                    {employee.firstName} {employee.lastName}
                  </Typography>
                </TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails(employee.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};