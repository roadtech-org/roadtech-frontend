import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Layout } from './components/layout';
import { ProtectedRoute } from './components/common';
import { useAuth } from './contexts/AuthContext';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { UserDashboard } from './pages/user/Dashboard';
import { RequestAssistance } from './pages/user/RequestAssistance';
import { RequestTracking } from './pages/user/RequestTracking';
import { RequestHistory } from './pages/user/RequestHistory';
import { MechanicDashboard } from './pages/mechanic/Dashboard';
import { JobDetails } from './pages/mechanic/JobDetails';
import { PartsSearch } from './pages/mechanic/PartsSearch';
import { PartsProviderDashboard } from './pages/partsProvider/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (user?.role) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    case 'MECHANIC':
      return <Navigate to="/mechanic" replace />;
    case 'PARTS_PROVIDER':
      return <Navigate to="/parts-provider" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <BrowserRouter>
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerStyle={{
                top: 20,
              }}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#0f172a', // slate-900
                  padding: '16px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #e5e7eb', // gray-200
                  boxShadow: '0 10px 20px -8px rgba(15, 23, 42, 0.15)',
                  maxWidth: '480px',
                },

                success: {
                  duration: 3000,
                  style: {
                    background: '#f0fdf4', // green-50
                    border: '1px solid #bbf7d0', // green-200
                    color: '#065f46', // green-800
                  },
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#ffffff',
                  },
                },

                error: {
                  duration: 6000,
                  style: {
                    background: '#fef2f2', // red-50
                    border: '1px solid #fecaca', // red-200
                    color: '#7f1d1d', // red-900
                  },
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },

                loading: {
                  duration: Infinity,
                  style: {
                    background: '#eff6ff', // blue-50
                    border: '1px solid #bfdbfe', // blue-200
                    color: '#1e40af', // blue-800
                  },
                  iconTheme: {
                    primary: '#2563eb',
                    secondary: '#ffffff',
                  },
                },
              }}

            />

            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<RoleRedirect />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                {/* User routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="request-assistance"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <RequestAssistance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="request/:id"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <RequestTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="history"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
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
                <Route
                  path="mechanic/parts-search"
                  element={
                    <ProtectedRoute allowedRoles={['MECHANIC']}>
                      <PartsSearch />
                    </ProtectedRoute>
                  }
                />

                {/* Parts Provider routes */}
                <Route
                  path="parts-provider"
                  element={
                    <ProtectedRoute allowedRoles={['PARTS_PROVIDER']}>
                      <PartsProviderDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<RoleRedirect />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;