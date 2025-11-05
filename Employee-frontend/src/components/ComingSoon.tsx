import { Box, Typography, Paper } from '@mui/material';
import '../styles/ComingSoon.scss';

interface ComingSoonProps {
  title: string;
}

export const ComingSoon = ({ title }: ComingSoonProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Coming Soon
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          This feature is under development. Check back later!
        </Typography>
      </Box>
    </Paper>
  );
};