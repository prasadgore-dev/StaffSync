import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';
import { leaveApi } from '../services/api';
import type { LeaveRequest } from '../types/index';

export const LeaveRequestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [newRequest, setNewRequest] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaveData = async () => {
    try {
      setIsLoading(true);
      const requests = await leaveApi.getRequests();
      setLeaveRequests(requests);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Validate dates
      if (!newRequest.startDate || !newRequest.endDate) {
        throw new Error('Start date and end date are required');
      }

      // Ensure end date is not before start date
      if (new Date(newRequest.endDate) < new Date(newRequest.startDate)) {
        throw new Error('End date cannot be before start date');
      }

      await leaveApi.submitRequest({
        leaveType: newRequest.type as 'vacation' | 'sick' | 'personal' | 'other',
        startDate: new Date(newRequest.startDate).toISOString(),
        endDate: new Date(newRequest.endDate).toISOString(),
        reason: newRequest.reason,
      });
      
      setOpenDialog(false);
      fetchLeaveData();
      setNewRequest({
        type: 'vacation',
        startDate: '',
        endDate: '',
        reason: '',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit leave request';
      setError(errorMessage);
      console.error('Error submitting leave request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Leave Requests</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          New Leave Request
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>
                      {format(new Date(request.startDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.endDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>{request.comments || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Leave Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={newRequest.type}
                label="Leave Type"
                onChange={(e) =>
                  setNewRequest({ ...newRequest, type: e.target.value })
                }
              >
                <MenuItem value="vacation">Vacation</MenuItem>
                <MenuItem value="sick">Sick Leave</MenuItem>
                <MenuItem value="personal">Personal Leave</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="date"
              label="Start Date"
              value={newRequest.startDate}
              onChange={(e) =>
                setNewRequest({ ...newRequest, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="date"
              label="End Date"
              value={newRequest.endDate}
              onChange={(e) =>
                setNewRequest({ ...newRequest, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Reason"
              multiline
              rows={4}
              value={newRequest.reason}
              onChange={(e) =>
                setNewRequest({ ...newRequest, reason: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};