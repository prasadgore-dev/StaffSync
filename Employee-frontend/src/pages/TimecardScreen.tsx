import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
} from '@mui/material';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { attendanceApi } from '../services/api';
import type { TimeEntry } from '../types';

export const TimecardScreen = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const fetchTimeEntries = async (start: Date, end: Date) => {
    try {
      setIsLoading(true);
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');
      const data = await attendanceApi.getTimecard(startStr, endStr);
      setTimeEntries(data);
    } catch (error) {
      console.error('Error fetching timecard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial data when component mounts or when view mode changes
  useEffect(() => {
    const start = viewMode === 'week'
      ? startOfWeek(currentDate, { weekStartsOn: 1 })
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = viewMode === 'week'
      ? endOfWeek(currentDate, { weekStartsOn: 1 })
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    fetchTimeEntries(start, end);
  }, [viewMode, currentDate]);

  const handlePreviousPeriod = () => {
    const newDate = viewMode === 'week' 
      ? subWeeks(currentDate, 1)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    const start = viewMode === 'week'
      ? startOfWeek(newDate, { weekStartsOn: 1 })
      : new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    const end = viewMode === 'week'
      ? endOfWeek(newDate, { weekStartsOn: 1 })
      : new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
    fetchTimeEntries(start, end);
  };

  const handleNextPeriod = () => {
    const newDate = viewMode === 'week'
      ? addWeeks(currentDate, 1)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    const start = viewMode === 'week'
      ? startOfWeek(newDate, { weekStartsOn: 1 })
      : new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    const end = viewMode === 'week'
      ? endOfWeek(newDate, { weekStartsOn: 1 })
      : new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
    fetchTimeEntries(start, end);
  };

  // Group entries by date
  const groupedEntries = timeEntries.reduce((acc, entry) => {
    const date = format(new Date(entry.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  // Calculate daily totals
  const dailyTotals = Object.entries(groupedEntries).map(([date, entries]) => {
    let totalHours = 0;
    let currentClockIn: Date | null = null;

    entries.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ).forEach(entry => {
      if (entry.type === 'clock-in') {
        currentClockIn = new Date(entry.timestamp);
      } else if (entry.type === 'clock-out' && currentClockIn) {
        const clockOut = new Date(entry.timestamp);
        totalHours += (clockOut.getTime() - currentClockIn.getTime()) / (1000 * 60 * 60);
        currentClockIn = null;
      }
    });

    return {
      date,
      entries,
      totalHours: Math.round(totalHours * 100) / 100,
    };
  });

  const handleClockIn = async () => {
    try {
      setIsLoading(true);
      await attendanceApi.clockIn();
      // Refresh timecard data
      const start = viewMode === 'week'
        ? startOfWeek(currentDate, { weekStartsOn: 1 })
        : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = viewMode === 'week'
        ? endOfWeek(currentDate, { weekStartsOn: 1 })
        : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      await fetchTimeEntries(start, end);
    } catch (error) {
      console.error('Error clocking in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setIsLoading(true);
      await attendanceApi.clockOut();
      // Refresh timecard data
      const start = viewMode === 'week'
        ? startOfWeek(currentDate, { weekStartsOn: 1 })
        : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = viewMode === 'week'
        ? endOfWeek(currentDate, { weekStartsOn: 1 })
        : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      await fetchTimeEntries(start, end);
    } catch (error) {
      console.error('Error clocking out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the user is currently clocked in
  const isCurrentlyClockedIn = timeEntries.length > 0 &&
    timeEntries.slice().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0].type === 'clock-in';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Timecard</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button onClick={handlePreviousPeriod} disabled={isLoading}>
            Previous {viewMode}
          </Button>
          <Button onClick={handleNextPeriod} disabled={isLoading}>
            Next {viewMode}
          </Button>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={viewMode}
              label="View"
              onChange={(e) => setViewMode(e.target.value as 'week' | 'month')}
            >
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color={isCurrentlyClockedIn ? "error" : "primary"}
            onClick={isCurrentlyClockedIn ? handleClockOut : handleClockIn}
            disabled={isLoading}
          >
            {isCurrentlyClockedIn ? "Clock Out" : "Clock In"}
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Total Hours</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyTotals.map(({ date, entries, totalHours }) => {
                const clockIns = entries.filter(e => e.type === 'clock-in');
                const clockOuts = entries.filter(e => e.type === 'clock-out');
                
                return (
                  <TableRow key={date}>
                    <TableCell>{format(new Date(date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {clockIns.map((entry, i) => (
                        <div key={i}>
                          {format(new Date(entry.timestamp), 'HH:mm')}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {clockOuts.map((entry, i) => (
                        <div key={i}>
                          {format(new Date(entry.timestamp), 'HH:mm')}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>{totalHours}</TableCell>
                    <TableCell>
                      {clockIns.length === clockOuts.length ? 'Complete' : 'Incomplete'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};