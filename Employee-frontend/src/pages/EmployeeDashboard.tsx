import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { format } from 'date-fns';
import { timecardApi, taskApi } from '../services/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'ongoing' | 'completed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export const EmployeeDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [lastClockIn, setLastClockIn] = useState<string | null>(null);
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        const today = format(new Date(), 'yyyy-MM-dd');
        const [timecardResponse, tasksResponse] = await Promise.all([
          timecardApi.getTimecard(),
          taskApi.getTasks()
        ]);

        if (timecardResponse) {
          setIsClockedIn(!timecardResponse.clockOut);
          setLastClockIn(timecardResponse.clockIn);
        } else {
          setIsClockedIn(false);
          setLastClockIn(null);
        }

        if (Array.isArray(tasksResponse)) {
          setTodaysTasks(tasksResponse);
        } else {
          setTodaysTasks([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleClockInOut = async () => {
    try {
      setError(null);
      setIsActionLoading(true);
      if (isClockedIn) {
        const response = await timecardApi.clockOut();
        setIsClockedIn(false);
        setLastClockIn(null);
      } else {
        const response = await timecardApi.clockIn();
        if (response && response.clockIn) {
          setLastClockIn(response.clockIn);
          setIsClockedIn(true);
        }
      }
    } catch (error) {
      console.error('Error with clock in/out:', error);
      setError('Failed to update timecard. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography variant="body1">
                  Status: {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                </Typography>
                {lastClockIn && (
                  <Typography variant="body2" color="text.secondary">
                    Last action: {format(new Date(lastClockIn), 'PPpp')}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color={isClockedIn ? 'secondary' : 'primary'}
                  onClick={handleClockInOut}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    isClockedIn ? 'Clock Out' : 'Clock In'
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Tasks
              </Typography>
              {todaysTasks.length === 0 ? (
                <Typography variant="body1">No tasks for today</Typography>
              ) : (
                todaysTasks.map((task) => (
                  <Box key={task.id} sx={{ mb: 1 }}>
                    <Typography variant="body1">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {task.status}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};