import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { Provider } from 'react-redux';
import { store } from './features/store';
import { Layout } from './components/Layout';
import { DashboardLayout } from './components/DashboardLayout';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaveRequestScreen } from "./pages/LeaveRequestScreen";
import { TaskManagementScreen } from "./pages/TaskManagementScreen";
import { TimecardHistory } from "./pages/TimecardHistory";
import { ManagerDashboard } from "./pages/manager/ManagerDashboard";
import { EmployeeStatusPage } from "./pages/manager/EmployeeStatusPage";
import { LeaveApprovalPage } from "./pages/manager/LeaveApprovalPage";

// Date picker provider
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <Routes>
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Employee Routes */}
              <Route index element={<EmployeeDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="timecard" element={<TimecardHistory />} />
              <Route path="leave" element={<LeaveRequestScreen />} />
              <Route path="tasks" element={<TaskManagementScreen />} />
              
              {/* Manager Routes */}
              <Route path="manager" element={<ManagerDashboard />} />
              <Route
                path="manager/employee-status"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <EmployeeStatusPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="manager/leave-approval"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <LeaveApprovalPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
