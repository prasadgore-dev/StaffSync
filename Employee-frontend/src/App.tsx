import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { Provider } from 'react-redux';
import { store } from './features/store';
import { Layout } from './components/Layout';
import { DashboardLayout } from './components/DashboardLayout';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { ComingSoon } from './components/ComingSoon';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { TeamAttendanceScreen } from './pages/manager/TeamAttendanceScreen';
import { LeaveApprovalScreen } from './pages/manager/LeaveApprovalScreen';
import { LeaveRequestScreen } from "./pages/LeaveRequestScreen";
import { TaskManagementScreen } from "./pages/TaskManagementScreen";

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
              <Route index element={<EmployeeDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="timecard" element={<ComingSoon title="Timecard" />} />
              <Route path="leave" element={<LeaveRequestScreen />} />
              <Route path="tasks" element={<TaskManagementScreen />} />
              <Route
                path="team-attendance"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <TeamAttendanceScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="leave-approval"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <LeaveApprovalScreen />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
