import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraViewProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not available. Ensure you are using HTTPS or localhost.');
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Video play failed:", e));
          };
        }
        setHasPermission(true);
      } catch (err) {
        console.error('Camera access error:', err);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    
    const image = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(image);
  };

  if (hasPermission === false) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#000', color: 'white', position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3>Camera Permission Denied</h3>
        <p>Please enable camera access in your settings to take photos.</p>
        <button onClick={onClose} className="secondary" style={{ marginTop: '1rem' }}>Go Back</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'black',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Viewfinder */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Overlay UI */}
        <div style={{ position: 'absolute', top: '2rem', left: '1.5rem' }}>
          <button 
            onClick={onClose}
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              color: 'white', 
              border: 'none', 
              padding: '10px', 
              borderRadius: '50%',
              display: 'flex'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Viewfinder Framing */}
        <div style={{ position: 'absolute', inset: '4rem', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '24px', pointerEvents: 'none' }} />
      </div>

      {/* Controls */}
      <div style={{ height: '160px', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2rem' }}>
        <div style={{ flex: 1 }} />
        
        <button 
          onClick={handleCapture}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '8px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'white', border: '2px solid #ddd' }} />
        </button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Flip camera placeholder */}
          <button style={{ backgroundColor: 'transparent', border: 'none', color: 'white', opacity: 0.5 }}>
            <RefreshCcw size={28} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CameraView;
