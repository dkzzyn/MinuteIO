import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import CreateMeeting from './pages/CreateMeeting';
import Settings from './pages/Settings';
import CaptureTabPage from './pages/CaptureTabPage';
import ReportsPage from './pages/Reports/ReportsPage';
import Project from './pages/Project';
import ProjectDetailPage from './pages/ProjectDetailPage';
import PaymentsPlansPage from './pages/PaymentsPlansPage';

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

const root = document.getElementById('root')!;
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
