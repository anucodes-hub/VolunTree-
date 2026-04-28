import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

interface PhotoSheetProps {
  onClose: () => void;
  onTakePhoto: () => void;
  onSelectGallery: () => void;
}

const PhotoSheet: React.FC<PhotoSheetProps> = ({ onClose, onTakePhoto, onSelectGallery }) => {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 200,
          backdropFilter: 'blur(4px)'
        }}
      />
      
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          padding: '2rem',
          zIndex: 201,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Capture Report</h3>
          <button 
            onClick={onClose}
            style={{ 
              border: 'none', 
              backgroundColor: 'var(--bg-warm)', 
              padding: '8px', 
              borderRadius: '50%', 
              cursor: 'pointer' 
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={onTakePhoto}
            style={{
              width: '100%',
              height: '72px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              padding: '0 2rem',
              gap: '1rem',
              cursor: 'pointer'
            }}
          >
            <Camera size={24} /> Take Photo
          </button>

          <button 
            onClick={onSelectGallery}
            style={{
              width: '100%',
              height: '72px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              backgroundColor: 'white',
              color: 'var(--text-main)',
              fontSize: '1.1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              padding: '0 2rem',
              gap: '1rem',
              cursor: 'pointer'
            }}
          >
            <ImageIcon size={24} /> Choose from Gallery
          </button>
        </div>

        {/* Accessibility Spacing for rural/elderly users */}
        <div style={{ height: '1.5rem' }} />
      </motion.div>
    </>
  );
};

export default PhotoSheet;
