import React, { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db, auth } from '../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { Bell, BellOff, X } from 'lucide-react';

const NotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [showPrompt, setShowPrompt] = useState(Notification.permission === 'default');

  const requestPermission = async () => {
    try {
      const status = await Notification.requestPermission();
      setPermission(status);
      
      if (status === 'granted') {
        // Get registration token
        const token = await getToken(messaging, {
          vapidKey: 'BM-VAPID-KEY-HERE' // This would come from Firebase Console
        });

        if (token && auth.currentUser) {
          console.log('FCM Token:', token);
          // Store token in user document
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await setDoc(userRef, { fcmToken: token }, { merge: true });
          
          // Also update volunteer document if they are a volunteer
          const volunteerRef = doc(db, 'volunteers', auth.currentUser.uid);
          await setDoc(volunteerRef, { fcmToken: token }, { merge: true });
        }
      }
      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  useEffect(() => {
    // Listen for messages when the app is in the foreground
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      // You could trigger a custom UI toast here
      alert(`New Notification: ${payload.notification?.title}\n${payload.notification?.body}`);
    });

    return () => unsubscribe();
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="glass shadow-premium" style={{
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      padding: '1.5rem',
      borderRadius: '24px',
      backgroundColor: 'white',
      width: '90%',
      maxWidth: '400px',
      border: '2px solid var(--primary)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(30, 122, 71, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}>
            <Bell size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Enable Notifications</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>Get instant match alerts for new missions.</p>
          </div>
        </div>
        <button onClick={() => setShowPrompt(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="primary" style={{ flex: 1, padding: '10px' }} onClick={requestPermission}>
          Allow
        </button>
        <button className="secondary" style={{ flex: 1, padding: '10px' }} onClick={() => setShowPrompt(false)}>
          Later
        </button>
      </div>
    </div>
  );
};

export default NotificationManager;
