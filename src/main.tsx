import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import CreateMeeting from "./pages/CreateMeeting";
import Settings from "./pages/Settings";
import CaptureTabPage from "./pages/CaptureTabPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import Project from "./pages/Project";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import PaymentsPlansPage from "./pages/PaymentsPlansPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SessionRoomPage from "./pages/SessionRoom/SessionRoomPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/session/:id" element={<ProtectedRoute><SessionRoomPage /></ProtectedRoute>} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/meetings/*" element={<Meetings />} />
                    <Route path="/project/:id" element={<ProjectDetailPage />} />
                    <Route path="/project" element={<Project />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/payments" element={<PaymentsPlansPage />} />
                    <Route path="/meetings/new" element={<CreateMeeting />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/capture-tab" element={<CaptureTabPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const root = document.getElementById('root')!;
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
