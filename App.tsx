import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Dashboard } from './pages/Dashboard';
import { CreateMemory } from './pages/wizard/CreateMemory';
import { EditMemory } from './pages/wizard/EditMemory';
import { PublicMemory } from './pages/PublicMemory';
import { ComingSoon } from './pages/ComingSoon';

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a global loading spinner

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* Public Routes with MainLayout */}
        <Route path="/" element={<MainLayout><Landing /></MainLayout>} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<MainLayout>{!user ? <Login /> : <Navigate to="/dashboard" />}</MainLayout>} />
        <Route path="/signup" element={<MainLayout>{!user ? <Signup /> : <Navigate to="/dashboard" />}</MainLayout>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<MainLayout>{user ? <Dashboard /> : <Navigate to="/login" />}</MainLayout>} />
        <Route path="/create" element={<MainLayout>{user ? <CreateMemory /> : <Navigate to="/login" />}</MainLayout>} />
        <Route path="/edit/:id" element={<MainLayout>{user ? <EditMemory /> : <Navigate to="/login" />}</MainLayout>} />
        <Route path="/coming-soon" element={<MainLayout>{user ? <ComingSoon /> : <Navigate to="/login" />}</MainLayout>} />

        {/* Standalone Route (Custom Layout inside component) */}
        <Route path="/view/:id" element={<PublicMemory />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;