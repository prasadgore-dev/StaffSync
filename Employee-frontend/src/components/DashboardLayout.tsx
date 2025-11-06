import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './styles/DashboardLayout.scss';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  AccessTime,
  EventNote,
  Assignment,
  Person,
  ExitToApp,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Timecard', icon: <AccessTime />, path: '/timecard' },
    { text: 'Leave Requests', icon: <EventNote />, path: '/leave' },
    { text: 'Tasks', icon: <Assignment />, path: '/tasks' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const managerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/manager' },
    { text: 'Employee Status', icon: <Person />, path: '/manager/employee-status' },
    { text: 'Leave Approval', icon: <EventNote />, path: '/manager/leave-approval' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const menuItems = user?.role === 'manager' ? managerMenuItems : employeeMenuItems;

  const drawer = (
    <Box className="dashboard-layout__drawer-content">
      <Box className="dashboard-layout__drawer-header">
        <Typography variant="h6" noWrap component="div">
          Employee Portal
        </Typography>
      </Box>
      <Box className="dashboard-layout__drawer-nav">
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box className="dashboard-layout">
      <CssBaseline />
      <AppBar position="fixed" className="dashboard-layout__app-bar">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="dashboard-layout__menu-button"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {user?.firstName ? `Welcome, ${user.firstName} ${user.lastName || ''}` : 'Employee Portal'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" className="dashboard-layout__drawer">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          className="dashboard-layout__drawer-temporary"
        >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            className="dashboard-layout__drawer-permanent"
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        className="dashboard-layout__main-content"
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};