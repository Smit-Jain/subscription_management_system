import LandingPage       from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import StaffManagementPage from './pages/StaffManagementPage';

export const publicRoutes = [
  { path: '',               element: <LandingPage /> },
  { path: 'login',          element: <LoginPage /> },
  { path: 'signup',         element: <SignupPage /> },
  { path: 'forgot-password',element: <ForgotPasswordPage /> },
  { path: 'reset-password', element: <ResetPasswordPage /> },
];

export const authAdminRoutes = [
  { path: 'staff', element: <StaffManagementPage /> },
];
