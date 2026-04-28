import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  Heart,
  Star,
  Zap,
  ArrowRight,
  Award,
  Camera
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { db, storage } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NotificationManager from './NotificationManager';

interface Task {
  id: string;
  title: string;
  location: string;
  urgency: number;
  status: string;
  category: string;
  summary: string;
  timestamp: string;
  coordinates: { lat: number; lng: number };
  suggested_skills?: string[];
  verified?: boolean;
}

const VolunteerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const volunteerId = 'v1'; // Simulated ID for demo

  const fetchTasks = async () => {
    try {
      setError(null);
      const res = await fetch('http://localhost:8000/volunteers/v1/tasks');
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Failed to fetch volunteer tasks:", err);
      setError(err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (id: string, imageFile?: File) => {
    setIsVerifying(true);
    try {
      let afterImageUrl = '';
      if (imageFile) {
        const imageRef = ref(storage, `verifications/${id}_${Date.now()}.jpg`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        afterImageUrl = await getDownloadURL(uploadResult.ref);
      }

      const formData = new FormData();
      formData.append('after_image_url', afterImageUrl);
      
      const res = await fetch(`http://localhost:8000/cases/${id}/verify`, {
        method: 'POST',
        body: formData
      });
      
      const verification = await res.json();
      if (verification.verified) {
        alert("Mission Verified! \n" + verification.analysis);
      } else {
        alert("Verification Note: " + verification.analysis);
      }
      
      fetchTasks();
      setActiveTask(null);
    } catch (err) {
      console.error("Failed to verify task:", err);
      alert("Failed to verify task. Please try again.");
    } finally {
      setIsVerifying(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeTask) {
      completeTask(activeTask.id, file);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Real-time Notifications
    const q = query(
      collection(db, 'notifications'),
      where('volunteer_id', '==', volunteerId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="volunteer-dashboard" style={{ paddingBottom: '120px', textAlign: 'left' }}>
      <NotificationManager />
      {/* Hero Stats */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass shadow-premium" style={{ flex: 1, padding: '2rem', borderRadius: '32px', backgroundColor: 'var(--primary)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', opacity: 0.8 }}>
              <Award size={20} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>LEVEL 12</span>
            </div>
            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: 'white' }}>2,450 XP</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>150 XP to next level</p>
          </div>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
            <Zap size={160} color="white" />
          </motion.div>
        </div>

        <div className="glass shadow-premium" style={{ width: '200px', padding: '2rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'white' }}>
          <div style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}><Heart size={32} /></div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>42</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Lives Impacted</div>
        </div>

        {/* Real-time Notifications Pill */}
        <div className="glass shadow-premium" style={{ width: '200px', padding: '2rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: notifications.some(n => n.status === 'unread') ? 'rgba(232, 135, 43, 0.1)' : 'white', border: notifications.some(n => n.status === 'unread') ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
          <div style={{ color: 'var(--accent)', marginBottom: '0.5rem', position: 'relative' }}>
            <Zap size={32} />
            {notifications.filter(n => n.status === 'unread').length > 0 && (
              <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                {notifications.filter(n => n.status === 'unread').length}
              </div>
            )}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{notifications.length}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Alerts</div>
        </div>
      </div>

      {error && (
        <div className="glass" style={{ 
          padding: '1rem', borderRadius: '16px', backgroundColor: 'rgba(226, 75, 74, 0.1)', 
          color: 'var(--accent)', marginBottom: '2rem', border: '1px solid var(--accent)',
          textAlign: 'center', fontWeight: 600
        }}>
          ⚠️ {error}. Please ensure the backend server is running.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Active Tasks List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t('dashboards.volunteer.tasksForYou')}</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{t('dashboards.volunteer.nearby', { location: 'Dhangaon' })}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {tasks.map(task => (
              <motion.div
                key={task.id}
                layoutId={task.id}
                onClick={() => setActiveTask(task)}
                className="glass shadow-premium"
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: '24px', 
                  border: activeTask?.id === task.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '14px', 
                      backgroundColor: 'var(--bg-warm)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' 
                    }}>
                      {task.category === 'Water' ? '💧' : '💊'}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{task.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.5 }}>{task.location} · {task.timestamp}</p>
                    </div>
                  </div>
                  <div style={{ 
                    padding: '6px 12px', borderRadius: '20px', 
                    backgroundColor: task.urgency > 80 ? 'rgba(226, 75, 74, 0.1)' : 'rgba(30, 122, 71, 0.1)', 
                    color: task.urgency > 80 ? 'var(--accent)' : 'var(--primary)',
                    fontSize: '0.7rem', fontWeight: 800
                  }}>
                    {task.urgency}% MATCH
                  </div>
                </div>
                
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.7, marginBottom: '1.25rem' }}>
                  {task.summary}
                </p>

                {activeTask?.id === task.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }} 
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        className="primary shadow-premium" 
                        style={{ flex: 1, borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }} 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <>
                            <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Camera size={18} />
                            Upload Proof of Fix
                          </>
                        )}
                      </button>
                      <button className="secondary" style={{ flex: 1, borderRadius: '12px' }} onClick={(e) => { e.stopPropagation(); completeTask(task.id); }}>
                        Complete without Proof
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>

            ))}
            
            {tasks.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                <CheckCircle2 size={64} style={{ marginBottom: '1rem' }} />
                <p>All caught up! No active tasks in your area.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mini Map & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass shadow-premium" style={{ 
            height: '300px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: 'white'
          }}>
            <MapContainer 
              center={[19.0760, 72.8777]} 
              zoom={11} 
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {tasks.map(t => (
                <Marker key={t.id} position={[t.coordinates.lat, t.coordinates.lng]}>
                  <Popup>{t.title}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="glass shadow-premium" style={{ padding: '1.5rem', borderRadius: '24px', backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Badges & Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {[
                { name: 'First Responder', icon: <Zap size={14} />, color: '#f59e0b' },
                { name: 'Water Expert', icon: <Heart size={14} />, color: '#3b82f6' },
                { name: 'Rural Hero', icon: <Star size={14} />, color: '#10b981' }
              ].map(badge => (
                <div key={badge.name} style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', 
                  padding: '8px 12px', borderRadius: '10px', 
                  backgroundColor: 'var(--bg-warm)', fontSize: '0.75rem', fontWeight: 600
                }}>
                  <span style={{ color: badge.color }}>{badge.icon}</span> {badge.name}
                </div>
              ))}
            </div>
          </div>

          <div className="glass shadow-premium" style={{ padding: '1.5rem', borderRadius: '24px', backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Recent Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.slice(0, 3).map(notif => (
                <div key={notif.id} style={{ 
                  padding: '12px', borderRadius: '12px', 
                  backgroundColor: notif.status === 'unread' ? 'rgba(232, 135, 43, 0.05)' : 'var(--bg-warm)',
                  border: notif.status === 'unread' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ fontWeight: 800, color: notif.status === 'unread' ? 'var(--accent)' : 'var(--text-main)' }}>
                    {notif.status === 'unread' ? 'NEW MISSION' : 'ALERT'}
                  </div>
                  <div style={{ opacity: 0.7, marginTop: '4px' }}>{notif.message}</div>
                </div>
              ))}
              {notifications.length === 0 && <p style={{ opacity: 0.4, fontSize: '0.8rem', textAlign: 'center' }}>No notifications yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
