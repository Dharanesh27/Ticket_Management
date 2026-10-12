import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CreateTicket } from './pages/customer/CreateTicket';
import { CustomerTicketList } from './pages/customer/CustomerTicketList';

// Agent Pages
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { AgentAssignedTickets } from './pages/agent/AgentAssignedTickets';
import { AgentUnassignedTickets } from './pages/agent/AgentUnassignedTickets';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAllTickets } from './pages/admin/AdminAllTickets';
import { AdminUserManagement } from './pages/admin/AdminUserManagement';

// Shared Pages
import { TicketDetails } from './pages/shared/TicketDetails';

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'ROLE_AGENT') return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER']} />}>
            <Route
              path="/customer/dashboard"
              element={<AppLayout><CustomerDashboard /></AppLayout>}
            />
            <Route
              path="/customer/tickets"
              element={<AppLayout><CustomerTicketList /></AppLayout>}
            />
            <Route
              path="/customer/create-ticket"
              element={<AppLayout><CreateTicket /></AppLayout>}
            />
          </Route>

          {/* Agent Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_AGENT', 'ROLE_ADMIN']} />}>
            <Route
              path="/agent/dashboard"
              element={<AppLayout><AgentDashboard /></AppLayout>}
            />
            <Route
              path="/agent/tickets"
              element={<AppLayout><AgentAssignedTickets /></AppLayout>}
            />
            <Route
              path="/agent/unassigned"
              element={<AppLayout><AgentUnassignedTickets /></AppLayout>}
            />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route
              path="/admin/dashboard"
              element={<AppLayout><AdminDashboard /></AppLayout>}
            />
            <Route
              path="/admin/tickets"
              element={<AppLayout><AdminAllTickets /></AppLayout>}
            />
            <Route
              path="/admin/users"
              element={<AppLayout><AdminUserManagement /></AppLayout>}
            />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/tickets/:id"
              element={<AppLayout><TicketDetails /></AppLayout>}
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
