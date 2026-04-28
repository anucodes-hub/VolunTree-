import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Delete, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PinEntryProps {
  onSuccess: (pin: string) => void;
  onBack: () => void;
  role: string;
}

const PinEntry: React.FC<PinEntryProps> = ({ onSuccess, onBack, role }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        // Simulate auth check
        if (newPin === '1234') {
          onSuccess(newPin);
        } else {
          setError(true);
          setTimeout(() => {
            setError(false);
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const roleInfo = {
    worker: { label: t('roles.worker.title'), color: 'var(--primary)' },
    coordinator: { label: t('roles.coordinator.title'), color: 'var(--secondary)' },
    volunteer: { label: t('roles.volunteer.title'), color: 'var(--info)' }
  }[role as 'worker' | 'coordinator' | 'volunteer'] || { label: t('common.signIn'), color: 'var(--primary)' };

  return (
    <div className="pin-entry glass shadow-premium" style={{ 
      maxWidth: '360px', 
      width: '100%',
      padding: '3rem 2rem', 
      borderRadius: '32px',
      textAlign: 'center',
      position: 'relative'
    }}>
      <button 
        onClick={onBack}
        style={{ 
          position: 'absolute', 
          top: '1.5rem', 
          left: '1.5rem', 
          border: 'none', 
          background: 'none', 
          cursor: 'pointer',
          opacity: 0.5
        }}
      >
        {t('common.back')}
      </button>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '20px', 
        backgroundColor: 'rgba(30, 122, 71, 0.08)', 
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem'
      }}>
        <ShieldCheck size={32} />
      </div>

      <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{t('pin.title')}</h2>
      <p style={{ marginBottom: '2.5rem', opacity: 0.6, fontSize: '0.9rem' }}>
        {t('pin.subtitle')} <span style={{ color: roleInfo.color, fontWeight: 700 }}>{roleInfo.label}</span>
      </p>

      {/* PIN Dots */}
      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0], color: 'var(--accent)' } : {}}
        style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem' }}
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              scale: pin.length > i ? 1.2 : 1,
              backgroundColor: pin.length > i ? (error ? 'var(--accent)' : 'var(--primary)') : 'var(--border)'
            }}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
          />
        ))}
      </motion.div>

      {/* Numpad */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1.25rem' 
      }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <motion.button
            key={num}
            whileHover={{ backgroundColor: 'var(--bg-warm)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePress(num)}
            style={{
              height: '72px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: 'var(--bg-white)',
              fontSize: '1.5rem',
              fontWeight: '600',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)'
            }}
          >
            {num}
          </motion.button>
        ))}
        <div /> {/* Spacer */}
        <motion.button
          whileHover={{ backgroundColor: 'var(--bg-warm)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handlePress('0')}
          style={{
            height: '72px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: 'var(--bg-white)',
            fontSize: '1.5rem',
            fontWeight: '600',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          0
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleDelete}
          style={{
            height: '72px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            opacity: 0.5
          }}
        >
          <Delete size={24} />
        </motion.button>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '8px', opacity: 0.4, fontSize: '0.8rem' }}>
        <span>{t('common.demoPin')}</span>
      </div>
    </div>
  );
};

export default PinEntry;


