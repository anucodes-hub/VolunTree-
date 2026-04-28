import React from 'react';
import { User, ClipboardCheck, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface RoleSelectionProps {
  onSelect: (role: 'worker' | 'volunteer' | 'coordinator') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  const { t } = useTranslation();

  const roles = [
    {
      id: 'worker',
      title: t('roles.worker.title'),
      desc: t('roles.worker.desc'),
      icon: <ClipboardCheck size={24} />,
      color: 'var(--primary)',
      bg: 'rgba(30, 122, 71, 0.08)'
    },
    {
      id: 'volunteer',
      title: t('roles.volunteer.title'),
      desc: t('roles.volunteer.desc'),
      icon: <User size={24} />,
      color: 'var(--info)',
      bg: 'rgba(55, 138, 221, 0.08)'
    },
    {
      id: 'coordinator',
      title: t('roles.coordinator.title'),
      desc: t('roles.coordinator.desc'),
      icon: <Shield size={24} />,
      color: 'var(--secondary)',
      bg: 'rgba(232, 160, 32, 0.08)'
    }
  ];

  return (
    <div className="role-selection" style={{ textAlign: 'center', width: '100%', maxWidth: '440px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 style={{ marginBottom: '0.75rem', fontSize: '2.2rem' }}>{t('roles.title')}</h1>
        <p style={{ marginBottom: '2.5rem', opacity: 0.8 }}>
          {t('roles.subtitle')}
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {roles.map((role, index) => (
          <motion.div 
            key={role.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(role.id as 'worker' | 'volunteer' | 'coordinator')}
            className="glass shadow-premium"
            style={{
              padding: '1.5rem',
              borderRadius: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '100%',
              backgroundColor: role.color
            }} />

            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              backgroundColor: role.bg, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: role.color,
              flexShrink: 0
            }}>
              {role.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem' }}>{role.title}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.4 }}>{role.desc}</p>
            </div>

            <div style={{ opacity: 0.3 }}>
              <ChevronRight size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8 }}
        style={{ marginTop: '3rem', fontSize: '0.8rem' }}
      >
        {t('roles.footer')}
      </motion.p>
    </div>
  );
};

export default RoleSelection;

