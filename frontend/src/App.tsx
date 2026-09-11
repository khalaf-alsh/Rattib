import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import AccountPage from "./pages/Account/AccountPage";
import DeveloperPage from "./pages/Developer/DeveloperPage";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPasswordPage";
import LoginPage from "./pages/Login/LoginPage";
import PrivacyPage from "./pages/Legal/PrivacyPage";
import RegisterPage from "./pages/Register/RegisterPage";
import ResetPasswordPage from "./pages/ResetPassword/ResetPasswordPage";
import SchedulePage from "./pages/Schedule/SchedulePage";
import TermsPage from "./pages/Legal/TermsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/privacy" element={<PrivacyPage />} />

      <Route path="/terms" element={<TermsPage />} />

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
