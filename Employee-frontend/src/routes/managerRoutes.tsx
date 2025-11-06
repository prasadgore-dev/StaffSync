import { Navigate, Outlet } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { EmployeeStatusPage } from '../pages/manager/EmployeeStatusPage';
import { LeaveApprovalPage } from '../pages/manager/LeaveApprovalPage';
import { RoleBasedRoute } from '../components/RoleBasedRoute';

export const managerRoutes: RouteObject[] = [
  {
    path: '/',
    element: <RoleBasedRoute allowedRoles={['manager']}><Outlet /></RoleBasedRoute>,
    children: [
      {
        path: '',
        element: <ManagerDashboard />
      },
      {
        path: 'employee-status',
        element: <EmployeeStatusPage />
      },
      {
        path: 'leave-approval',
        element: <LeaveApprovalPage />
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
];