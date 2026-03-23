import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
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
import PostsPage from "./pages/PostsPage";
import AgentsPage from "./pages/AgentsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SessionRoomPage from "./pages/SessionRoom/SessionRoomPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import ApisPage from "./pages/ApisPage";
import TrainingLayout from "./pages/Training/TrainingLayout";
import TrainingHubPage from "./pages/Training/TrainingHubPage";
import TrainingProductPage from "./pages/Training/TrainingProductPage";
import TrainingSimulatorPage from "./pages/Training/TrainingSimulatorPage";
import TrainingObjectionsPage from "./pages/Training/TrainingObjectionsPage";
import TrainingDashboardsPage from "./pages/Training/TrainingDashboardsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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
                    <Route path="/posts" element={<PostsPage />} />
                    <Route path="/agents" element={<AgentsPage />} />
                    <Route path="/perfil" element={<ProfilePage />} />
                    <Route path="/teams" element={<Navigate to="/perfil" replace />} />
                    <Route path="/payments" element={<PaymentsPlansPage />} />
                    <Route path="/meetings/new" element={<CreateMeeting />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/apis" element={<ApisPage />} />
                    <Route path="/capture-tab" element={<CaptureTabPage />} />
                    <Route path="/training" element={<TrainingLayout />}>
                      <Route index element={<TrainingHubPage />} />
                      <Route path="product" element={<TrainingProductPage />} />
                      <Route path="simulator" element={<TrainingSimulatorPage />} />
                      <Route path="objections" element={<TrainingObjectionsPage />} />
                      <Route path="dashboards" element={<TrainingDashboardsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const root = document.getElementById('root')!;
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
