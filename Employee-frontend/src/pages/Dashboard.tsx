import { Box, Typography, Container } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.firstName} {user?.lastName}!
        </Typography>
        <Typography variant="body1">
          This is your employee dashboard. Here you can manage your attendance,
          leave requests, and view your profile.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;