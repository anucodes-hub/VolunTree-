import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogOut, User as UserIcon, Map as MapIcon, Bell } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const AppHeader: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { t } = useTranslation();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false);
    await logout();
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'worker': return 'Field Worker';
      case 'volunteer': return 'Volunteer';
      case 'coordinator': return 'NGO Coordinator';
      default: return 'User';
    }
  };

  return (
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0',
        marginBottom: '2rem',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', padding: '8px', borderRadius: '10px', color: 'white' }}>
            <MapIcon size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: 0, letterSpacing: '-0.02em', fontWeight: 800 }}>VolunTree</h2>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{getRoleLabel()}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button className="glass" style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 6px 6px 14px', borderRadius: '14px', backgroundColor: 'white', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>{user?.email?.split('@')[0] || user?.phoneNumber || 'User'}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.4 }}>Active Session</div>
            </div>
            <button 
              onClick={() => setIsLogoutDialogOpen(true)}
              style={{ 
                width: '36px', height: '36px', borderRadius: '10px', 
                backgroundColor: 'rgba(226, 75, 74, 0.08)', color: 'var(--accent)', 
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <ConfirmDialog 
        isOpen={isLogoutDialogOpen}
        title="Logout Confirmation"
        message="Are you sure you want to log out of your session? You will need to re-authenticate to access your dashboard."
        confirmLabel="Logout Now"
        cancelLabel="Stay Logged In"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
        type="danger"
      />
    </>
  );
};

export default AppHeader;
