import { useState, Suspense, useEffect } from 'react';
import Home from './components/Home';
import RoleSelection from './components/RoleSelection';
import Login from './components/Login';
import CaptureScreen from './components/CaptureScreen';
import CoordinatorDashboard from './components/CoordinatorDashboard';
import VolunteerDashboard from './components/VolunteerDashboard';
import AppHeader from './components/AppHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';

function LoadingScreen() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-warm)' }}>
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
        VolunTree
      </motion.div>
    </div>
  );
}

function AppContent() {
  const { t } = useTranslation();
  const { user, role, loading, setRole } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedPreRole, setSelectedPreRole] = useState<'worker' | 'volunteer' | 'coordinator' | null>(null);

  // Auto-assign role if selected before login
  useEffect(() => {
    if (user && !role && selectedPreRole) {
      setRole(selectedPreRole);
      setSelectedPreRole(null);
    }
  }, [user, role, selectedPreRole, setRole]);

  if (loading) return <LoadingScreen />;

  const renderContent = () => {
    // 1. Not Logged In
    if (!user) {
      if (selectedPreRole) {
        return <Login onSuccess={() => setShowLogin(false)} />;
      }
      
      if (showLogin) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
            <RoleSelection onSelect={(selectedRole) => setSelectedPreRole(selectedRole)} />
          </div>
        );
      }
      return <Home onGetStarted={(preSelectedRole) => {
        if (preSelectedRole) setSelectedPreRole(preSelectedRole);
        setShowLogin(true);
      }} />;
    }

    // 2. Logged In but no Role (fallback if they signed in directly)
    if (!role) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
          <RoleSelection onSelect={(selectedRole) => setRole(selectedRole)} />
        </div>
      );
    }

    // 3. Authenticated and Role Assigned
    return (
      <>
        <AppHeader />
        <div style={{ width: '100%' }}>
          {role === 'coordinator' ? (
            <CoordinatorDashboard />
          ) : role === 'worker' ? (
            <CaptureScreen />
          ) : (
            <VolunteerDashboard />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="app-wrapper" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="app-container" style={{ 
        width: '100%',
        maxWidth: (user && role === 'coordinator') ? '1400px' : '1100px',
        padding: (user && role === 'coordinator') ? '1rem' : '2rem',
        margin: '0 auto'
      }}>
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={user ? (role || 'selection') : (showLogin ? 'login' : 'home')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

