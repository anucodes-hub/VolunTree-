import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, MapPin, CheckCircle, RefreshCw, Send, WifiOff, Cloud, X, Trash2, Loader2 } from 'lucide-react';
import SubmissionHistory from './SubmissionHistory';
import PhotoSheet from './PhotoSheet';
import CameraView from './CameraView';
import { compressImage, getCurrentLocation } from './ImageUtils';
import type { LocationData } from './ImageUtils';
import { useTranslation } from 'react-i18next';
import { storage } from '../firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

type CaptureFlowState = 'idle' | 'choosing' | 'capturing' | 'previewing' | 'processing' | 'success';

const CaptureScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [flowState, setFlowState] = useState<CaptureFlowState>('idle');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const { t } = useTranslation();
  
  // Photo-specific state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const queue = JSON.parse(localStorage.getItem('offline_reports') || '[]');
    setQueueCount(queue.length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const issues = [
    { id: 'water', label: t('capture.categories.water'), icon: '💧' },
    { id: 'food', label: t('capture.categories.food'), icon: '🌾' },
    { id: 'medical', label: t('capture.categories.medical'), icon: '💊' },
    { id: 'shelter', label: t('capture.categories.shelter'), icon: '🏠' },
    { id: 'safety', label: t('capture.categories.safety'), icon: '🛡️' },
    { id: 'other', label: t('capture.categories.other'), icon: '📝' },
  ];

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          
          // Auto-process voice with AI
          setFlowState('processing');
          try {
            const formData = new FormData();
            formData.append('audio', blob);
            const res = await fetch('http://localhost:8000/reports/voice', {
              method: 'POST',
              body: formData
            });
            const data = await res.json();
            if (data.category) {
              setSelectedIssue(data.category.toLowerCase());
              // Trigger a small toast or UI hint here if possible
            }
          } catch (err) {
            console.error("Voice processing failed:", err);
          } finally {
            setFlowState('idle');
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Could not start recording:", err);
      }
    }
  };

  const handlePhotoClick = () => {
    setFlowState('choosing');
  };

  const onCapture = async (image: string) => {
    setFlowState('processing');
    try {
      // Fetch location at moment of capture
      const loc = await getCurrentLocation().catch(() => ({ lat: 19.0760, lng: 72.8777 }));
      setLocation(loc);
      
      // Note: Custom CameraView already gives a dataURL, 
      // but if we used gallery, we'd compress the File object.
      setCapturedImage(image);
      setFlowState('previewing');
    } catch (err) {
      console.error(err);
      setFlowState('idle');
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFlowState('processing');
    compressImage(file)
      .then(async (compressed) => {
        const loc = await getCurrentLocation().catch(() => ({ lat: 19.0760, lng: 72.8777 }));
        setLocation(loc);
        setCapturedImage(compressed);
        setFlowState('previewing');
      })
      .catch(() => setFlowState('idle'));
  };

  const handleSubmit = async () => {
    if (!selectedIssue) return;
    
    const reportData = {
      id: Date.now().toString(),
      type: selectedIssue,
      description: isRecording ? "Multimodal voice note input captured." : (capturedImage ? "Visual evidence attached." : "Manual report."),
      lat: location?.lat.toString() || '19.0760',
      lng: location?.lng.toString() || '72.8777',
      timestamp: new Date().toISOString(),
      icon: issues.find(i => i.id === selectedIssue)?.icon || '📝',
      image: capturedImage // Store base64 image
    };

    if (!isOnline) {
      const queue = JSON.parse(localStorage.getItem('offline_reports') || '[]');
      queue.push({ ...reportData, status: 'queued' });
      localStorage.setItem('offline_reports', JSON.stringify(queue));
      setQueueCount(queue.length);
      
      setFlowState('success');
      setTimeout(() => {
        setFlowState('idle');
        setSelectedIssue(null);
        setCapturedImage(null);
      }, 2000);
      return;
    }
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = null;
      
      // Upload image to Firebase Storage if present
      if (capturedImage) {
        const imageRef = ref(storage, `reports/${reportData.id}.jpg`);
        // capturedImage is a dataURL (base64)
        const uploadResult = await uploadString(imageRef, capturedImage, 'data_url');
        finalImageUrl = await getDownloadURL(uploadResult.ref);
      }

      const formData = new FormData();
      formData.append('type', reportData.type);
      formData.append('description', reportData.description);
      formData.append('lat', reportData.lat);
      formData.append('lng', reportData.lng);
      if (finalImageUrl) {
        formData.append('image_url', finalImageUrl);
      }
      
      const res = await fetch('http://localhost:8000/reports', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setFlowState('success');
        setTimeout(() => {
          setFlowState('idle');
          setSelectedIssue(null);
          setCapturedImage(null);
        }, 2000);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      const queue = JSON.parse(localStorage.getItem('offline_reports') || '[]');
      queue.push({ ...reportData, status: 'failed' });
      localStorage.setItem('offline_reports', JSON.stringify(queue));
      setQueueCount(queue.length);
      setFlowState('success');
      setTimeout(() => {
        setFlowState('idle');
        setSelectedIssue(null);
        setCapturedImage(null);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="capture-screen" style={{ paddingBottom: '120px' }}>
      {/* Hidden Gallery Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleGallerySelect} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ 
              backgroundColor: '#1A1A18', 
              color: 'white', 
              padding: '10px', 
              textAlign: 'center', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              borderRadius: '0 0 16px 16px',
              marginBottom: '1rem',
              fontWeight: 600
            }}
          >
            <WifiOff size={16} /> {t('capture.noConnectivity')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with GPS Status */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '0 0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(30, 122, 71, 0.1)', color: 'var(--primary)' }}>
            <MapPin size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Dhangaon, Ward 4</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{t('capture.updated', { time: '1m' })}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {queueCount > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(255, 165, 0, 0.1)', 
              padding: '6px 12px', 
              borderRadius: '20px',
              fontSize: '0.75rem',
              color: 'orange',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Cloud size={14} /> {t('capture.queued', { count: queueCount })}
            </div>
          )}
          <div style={{ 
            backgroundColor: 'rgba(60, 179, 113, 0.1)', 
            padding: '6px 12px', 
            borderRadius: '20px',
            fontSize: '0.75rem',
            color: 'var(--primary)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'pulse 1.5s infinite' }} />
            {t('capture.liveGps')}
          </div>
        </div>
      </div>

      {/* Camera Preview / Captured Image Area */}
      <div className="shadow-premium" style={{ 
        width: '100%', 
        aspectRatio: '4/3', 
        backgroundColor: '#000', 
        borderRadius: '24px', 
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '2rem',
        border: '4px solid var(--bg-white)',
        boxShadow: 'var(--shadow-md)'
      }}>
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Capture" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            opacity: 0.3
          }}>
            <Camera size={64} />
          </div>
        )}
        
        {/* Processing State */}
        {flowState === 'processing' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '1rem' }}>
            <Loader2 className="spin" size={48} />
            <span>{t('capture.optimizing')}</span>
          </div>
        )}

        {/* Viewfinder Corners */}
        <div style={{ position: 'absolute', top: 24, left: 24, width: 40, height: 40, borderLeft: '2px solid rgba(255,255,255,0.5)', borderTop: '2px solid rgba(255,255,255,0.5)', borderRadius: '4px 0 0 0' }} />
        <div style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, borderRight: '2px solid rgba(255,255,255,0.5)', borderTop: '2px solid rgba(255,255,255,0.5)', borderRadius: '0 4px 0 0' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24, width: 40, height: 40, borderLeft: '2px solid rgba(255,255,255,0.5)', borderBottom: '2px solid rgba(255,255,255,0.5)', borderRadius: '0 0 0 4px' }} />
        <div style={{ position: 'absolute', bottom: 24, right: 24, width: 40, height: 40, borderRight: '2px solid rgba(255,255,255,0.5)', borderBottom: '2px solid rgba(255,255,255,0.5)', borderRadius: '0 0 4px 0' }} />

        {flowState === 'success' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              position: 'absolute', 
              inset: 0, 
              backgroundColor: 'rgba(30, 122, 71, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle size={64} color="white" />
          </motion.div>
        )}

        {/* Retake Button overlay */}
        {capturedImage && flowState === 'previewing' && (
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => { setCapturedImage(null); setFlowState('idle'); }}
              style={{ backgroundColor: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Trash2 size={16} /> {t('capture.remove')}
            </button>
            <button 
              onClick={handlePhotoClick}
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <RefreshCw size={16} /> {t('capture.retake')}
            </button>
          </div>
        )}
      </div>

      {/* Voice & Photo Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <button 
          onClick={handlePhotoClick}
          className="primary shadow-premium" 
          style={{ flex: 1, height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.05rem' }}
        >
          <Camera size={22} /> {t('capture.photo')}
        </button>
        <motion.button 
          animate={isRecording ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={toggleRecording}
          style={{ 
            flex: 1, 
            height: '72px', 
            borderRadius: '20px',
            backgroundColor: isRecording ? 'var(--accent)' : 'var(--secondary)',
            color: 'white',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem',
            fontSize: '1.05rem',
            border: 'none',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {isRecording ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '20px' }}>
              {[0.6, 1, 0.8, 1.2, 0.7, 1.1, 0.9].map((scale, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: isRecording ? [10 * scale, 20 * scale, 10 * scale] : 10 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.6 + (i * 0.1),
                    ease: "easeInOut"
                  }}
                  style={{ 
                    width: '3px', 
                    backgroundColor: 'white', 
                    borderRadius: '2px' 
                  }}
                />
              ))}
            </div>
          ) : (
            <><Mic size={22} /> {t('capture.voice')}</>
          )}
        </motion.button>
      </div>

      {/* Issue Type Picker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem' }}>{t('capture.category')}</h3>
        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{t('capture.selectOne')}</span>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem' 
      }}>
        {issues.map((issue) => (
          <motion.div
            key={issue.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedIssue(issue.id)}
            className="glass"
            style={{
              padding: '1.25rem 0.5rem',
              borderRadius: '20px',
              backgroundColor: selectedIssue === issue.id ? 'rgba(30, 122, 71, 0.05)' : 'var(--bg-white)',
              border: `2px solid ${selectedIssue === issue.id ? 'var(--primary)' : 'transparent'}`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: selectedIssue === issue.id ? 'none' : 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '1.75rem' }}>{issue.icon}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedIssue === issue.id ? 'var(--primary)' : 'var(--text-main)' }}>{issue.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Submission History Section */}
      <div style={{ marginTop: '4rem' }}>
        <SubmissionHistory queueUpdated={queueCount} />
      </div>

      {/* Submit Button (Fixed at bottom) */}
      <div className="glass" style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: '1.5rem 2rem 2.5rem', 
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        zIndex: 100,
        borderRadius: '32px 32px 0 0'
      }}>
        <button 
          className="primary shadow-premium" 
          disabled={!selectedIssue || isSubmitting}
          onClick={handleSubmit}
          style={{ 
            width: '100%', 
            height: '64px', 
            fontSize: '1.15rem', 
            opacity: selectedIssue ? 1 : 0.4,
            gap: '12px',
            borderRadius: '20px',
            backgroundColor: !isOnline ? 'var(--secondary)' : 'var(--primary)'
          }}
        >
          {isSubmitting ? t('common.loading') : (!isOnline ? t('common.saveForSync') : t('common.submit'))} 
          {isOnline ? <Send size={20} /> : <Cloud size={20} />}
        </button>
      </div>

      {/* Modals & Sheets */}
      <AnimatePresence>
        {flowState === 'choosing' && (
          <PhotoSheet 
            onClose={() => setFlowState('idle')}
            onTakePhoto={() => setFlowState('capturing')}
            onSelectGallery={() => fileInputRef.current?.click()}
          />
        )}
        {flowState === 'capturing' && (
          <CameraView 
            onClose={() => setFlowState('idle')}
            onCapture={onCapture}
          />
        )}
      </AnimatePresence>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CaptureScreen;


