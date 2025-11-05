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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { managerApi } from '../../services/api';
import type { LeaveRequest, User } from '../../types';

interface LeaveRequestWithUser extends LeaveRequest {
  user: User;
}

export const LeaveApprovalScreen = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestWithUser | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'approved' | 'rejected'>('approved');

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const data = await managerApi.getLeaveRequests();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleApprovalAction = async () => {
    if (!selectedRequest) return;

    try {
      setIsLoading(true);
      await managerApi.reviewLeaveRequest(selectedRequest.id, {
        status: selectedStatus,
        comments,
      });
      setOpenDialog(false);
      setSelectedRequest(null);
      setComments('');
      await fetchLeaveRequests();
    } catch (error) {
      console.error('Error updating leave request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Leave Requests
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.user.firstName} {request.user.lastName}
                  </TableCell>
                  <TableCell>{request.user.department}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>
                    {format(new Date(request.startDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.endDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedRequest(request);
                          setOpenDialog(true);
                        }}
                      >
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Leave Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography>
                <strong>Employee: </strong>
                {selectedRequest.user.firstName} {selectedRequest.user.lastName}
              </Typography>
              <Typography>
                <strong>Leave Type: </strong>
                {selectedRequest.type}
              </Typography>
              <Typography>
                <strong>Duration: </strong>
                {format(new Date(selectedRequest.startDate), 'MMM dd, yyyy')} -{' '}
                {format(new Date(selectedRequest.endDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography>
                <strong>Reason: </strong>
                {selectedRequest.reason}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Decision</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Decision"
                  onChange={(e) => setSelectedStatus(e.target.value as 'approved' | 'rejected')}
                >
                  <MenuItem value="approved">Approve</MenuItem>
                  <MenuItem value="rejected">Reject</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Comments"
                multiline
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleApprovalAction}
            variant="contained"
            color={selectedStatus === 'approved' ? 'success' : 'error'}
          >
            {selectedStatus === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};