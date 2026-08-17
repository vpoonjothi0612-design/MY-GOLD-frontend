import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { GoldRateProvider } from './context/GoldRateContext';
import { PWAProvider } from './context/PWAContext';

import Navbar from './components/common/Navbar';
import BottomNavigation from './components/BottomNavigation';
import FloatingInstallButton from './components/common/FloatingInstallButton';
import InstallModal from './components/common/InstallModal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import MyGold from './pages/MyGold';
import AddGold from './pages/AddGold';
import GoldRates from './pages/GoldRates';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotUsername from './pages/ForgotUsername';
import AdminDashboard from './pages/AdminDashboard';

const AppLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-username';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-300 bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Ambient Gold Radial Glow Effect */}
      <div className="ambient-glow" aria-hidden="true" />

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111726',
            color: '#F8FAFC',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(245, 158, 11, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#F43F5E',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      {/* 1. Top Header (Navbar) */}
      {!isAuthRoute && <Navbar />}

      {/* 2. Main Dashboard & App Content Area */}
      <main
        className={
          isAuthRoute
            ? 'flex-1 w-full mx-auto relative z-10 flex items-center justify-center'
            : 'flex-1 max-w-[1180px] w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-8 relative z-10'
        }
      >
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-username" element={<ForgotUsername />} />

          {/* Protected Vault Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-gold"
            element={
              <ProtectedRoute>
                <MyGold />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-gold"
            element={
              <ProtectedRoute>
                <AddGold />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gold-rates"
            element={
              <ProtectedRoute>
                <GoldRates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating PWA Install Button Widget */}
      <FloatingInstallButton />

      {/* In-App Install Modal (replaces browser popup) */}
      <InstallModal />

      {/* Mobile Bottom Navigation (Hidden on Auth Pages) */}
      {!isAuthRoute && <BottomNavigation />}
    </div>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <GoldRateProvider>
            <PWAProvider>
              <BrowserRouter>
                <AppLayout />
              </BrowserRouter>
            </PWAProvider>
          </GoldRateProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
