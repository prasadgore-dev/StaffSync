import { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import { format, subDays, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';
import { timecardApi } from '../services/api';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface Timecard {
  id: string;
  clockIn: string;
  clockOut: string | null;
  totalHours?: number;
  status: 'complete' | 'incomplete';
}

export const TimecardHistory = () => {
  const [timecards, setTimecards] = useState<Timecard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const fetchTimecards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timecardApi.getTimecardHistory(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );

      const processedTimecards = response.map((timecard: Timecard) => ({
        ...timecard,
        totalHours: timecard.clockOut
          ? calculateHours(timecard.clockIn, timecard.clockOut)
          : undefined,
        status: timecard.clockOut ? 'complete' : 'incomplete'
      }));

      setTimecards(processedTimecards);
    } catch (err) {
      console.error('Error fetching timecard history:', err);
      setError('Failed to load timecard history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimecards();
  }, [startDate, endDate]);

  const calculateHours = (clockIn: string, clockOut: string) => {
    const startTime = parseISO(clockIn);
    const endTime = parseISO(clockOut);
    const hours = differenceInHours(endTime, startTime);
    const minutes = differenceInMinutes(endTime, startTime) % 60;
    return Number((hours + minutes / 60).toFixed(2));
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status'],
      ...timecards.map(timecard => [
        format(parseISO(timecard.clockIn), 'yyyy-MM-dd'),
        format(parseISO(timecard.clockIn), 'HH:mm:ss'),
        timecard.clockOut ? format(parseISO(timecard.clockOut), 'HH:mm:ss') : 'N/A',
        timecard.totalHours?.toString() || 'N/A',
        timecard.status
      ])
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `timecard_history_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const calculateTotalHours = () => {
    return timecards
      .filter(timecard => timecard.totalHours)
      .reduce((total, timecard) => total + (timecard.totalHours || 0), 0)
      .toFixed(2);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Timecard History</Typography>
        <IconButton onClick={handleExport} title="Export to CSV">
          <FileDownloadIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newValue) => newValue && setStartDate(newValue)}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newValue) => newValue && setEndDate(newValue)}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">
              Total Hours: {calculateTotalHours()} hours
            </Typography>
          </Box>

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
                {timecards.map((timecard) => (
                  <TableRow 
                    key={timecard.id}
                    sx={{ 
                      backgroundColor: timecard.status === 'incomplete' ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      {format(parseISO(timecard.clockIn), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(timecard.clockIn), 'HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {timecard.clockOut
                        ? format(parseISO(timecard.clockOut), 'HH:mm:ss')
                        : 'Not clocked out'}
                    </TableCell>
                    <TableCell>
                      {timecard.totalHours ? `${timecard.totalHours} hours` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {timecard.status === 'complete' ? 'Complete' : 'Incomplete'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};