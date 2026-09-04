import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { LandAiConsole } from './components/LandAiConsole';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Government Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Official Officer Authentication Gateway */}
          <Route path="/login" element={<LoginPage />} />

          {/* Unauthorized / Incomplete Profile Error View */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Compatibility Gateway Redirect */}
          <Route path="/redirect" element={<Navigate to="/app" replace />} />

          {/* Protected Operational Application Workspaces */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <LandAiConsole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <LandAiConsole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LandAiConsole />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
