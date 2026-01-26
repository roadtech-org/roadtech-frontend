import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout';
import { ProtectedRoute } from './components/common';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { UserDashboard } from './pages/user/Dashboard';
import { RequestAssistance } from './pages/user/RequestAssistance';
import { RequestTracking } from './pages/user/RequestTracking';
import { RequestHistory } from './pages/user/RequestHistory';
import { MechanicDashboard } from './pages/mechanic/Dashboard';
import { JobDetails } from './pages/mechanic/JobDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {/* RoadTech themed toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                padding: '16px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#065f46',
                  border: '1px solid #10b981',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4500,
                style: {
                  background: '#7f1d1d',
                  border: '1px solid #ef4444',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              loading: {
                duration: Infinity,
                style: {
                  background: '#1e40af',
                  border: '1px solid #3b82f6',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* User routes */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="request-assistance"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <RequestAssistance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="request/:id"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <RequestTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="history"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <RequestHistory />
                  </ProtectedRoute>
                }
              />

              {/* Mechanic routes */}
              <Route
                path="mechanic"
                element={
                  <ProtectedRoute allowedRoles={['MECHANIC']}>
                    <MechanicDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="mechanic/job/:id"
                element={
                  <ProtectedRoute allowedRoles={['MECHANIC']}>
                    <JobDetails />
                  </ProtectedRoute>
                }
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;