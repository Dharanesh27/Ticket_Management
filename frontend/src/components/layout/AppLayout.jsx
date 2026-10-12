import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Inbox,
  Users,
  LogOut,
  Headphones,
  Shield,
  UserCheck
} from 'lucide-react';

export const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRight: '1px solid #1e293b'
        }}
      >
        {/* Brand */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #1e293b' }}>
          <Headphones size={28} color="#3b82f6" />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>SupportDesk</h1>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Enterprise Helpdesk</span>
          </div>
        </div>

        {/* Navigation links based on role */}
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {user?.role === 'ROLE_CUSTOMER' && (
            <>
              <NavLink
                to="/customer/dashboard"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: 500
                })}
              >
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>

              <NavLink
                to="/customer/tickets"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: 500
                })}
              >
                <Ticket size={18} /> My Tickets
              </NavLink>

              <NavLink
                to="/customer/create-ticket"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: 500
                })}
              >
                <PlusCircle size={18} /> New Ticket
              </NavLink>
            </>
          )}

          {user?.role === 'ROLE_AGENT' && (
            <>
              <NavLink
                to="/agent/dashboard"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: 500
                })}
              >
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>

              <NavLink
                to="/agent/tickets"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: 500
                })}
              >
                <Ticket size={18} /> Assigned Tickets
              </NavLink>

              <NavLink
                to="/agent/unassigned"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: 500
                })}
              >
                <Inbox size={18} /> Unassigned Queue
              </NavLink>
            </>
          )}

          {user?.role === 'ROLE_ADMIN' && (
            <>
              <NavLink
                to="/admin/dashboard"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: 500
                })}
              >
                <LayoutDashboard size={18} /> Admin Dashboard
              </NavLink>

              <NavLink
                to="/admin/tickets"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: 500
                })}
              >
                <Shield size={18} /> All Tickets
              </NavLink>

              <NavLink
                to="/admin/users"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: 500
                })}
              >
                <Users size={18} /> User Management
              </NavLink>
            </>
          )}
        </nav>

        {/* User profile & Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                color: '#fff'
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {user?.role?.replace('ROLE_', '')}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', backgroundColor: '#1e293b', color: '#f8fafc', borderColor: '#334155' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem'
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Welcome back, <strong>{user?.name}</strong>
          </div>
          <div>
            <span className="badge badge-open">System Status: Active</span>
          </div>
        </header>

        <div style={{ padding: '2rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
