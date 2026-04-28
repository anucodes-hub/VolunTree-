import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  if (!isOpen) return null;

  const accentColor = type === 'danger' ? 'var(--accent)' : (type === 'warning' ? 'var(--secondary)' : 'var(--primary)');

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)'
      }} onClick={onCancel}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass shadow-premium"
          style={{
            maxWidth: '400px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: '2.5rem',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <button 
            onClick={onCancel}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: `${accentColor}10`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <AlertCircle size={32} />
          </div>

          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>{title}</h3>
          <p style={{ marginBottom: '2rem', fontSize: '0.95rem', opacity: 0.7 }}>{message}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              className="primary" 
              onClick={onConfirm}
              style={{ backgroundColor: accentColor, width: '100%', padding: '1rem' }}
            >
              {confirmLabel}
            </button>
            <button 
              className="secondary" 
              onClick={onCancel}
              style={{ width: '100%', padding: '1rem', border: 'none' }}
            >
              {cancelLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
