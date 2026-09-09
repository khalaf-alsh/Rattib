import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DeveloperPage from "./pages/Developer/DeveloperPage";
import SchedulePage from "./pages/Schedule/SchedulePage";
import AccountPage from "./pages/Account/AccountPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPassword/ResetPasswordPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/schedule" replace />} />

      <Route path="*" element={<Navigate to="/schedule" replace />} />
    </Routes>
  );
}

export default App;
