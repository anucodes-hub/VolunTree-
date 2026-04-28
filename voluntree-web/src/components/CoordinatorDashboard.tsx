import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  Users, 
  Search, 
  Bell, 
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import ImpactAnalytics from './ImpactAnalytics';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Case {
  id: string;
  title: string;
  location: string;
  urgency: number;
  status: 'pending' | 'assigned' | 'resolved';
  category: string;
  timestamp: string;
  coordinates: [number, number];
}

interface AnalyticsData {
  total_cases: number;
  categories: Record<string, number>;
  statuses: { pending: number; assigned: number; resolved: number };
  avg_urgency: number;
  active_volunteers: number;
}

const CoordinatorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Real-time Cases Listener
    const q = query(collection(db, 'cases'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setCases(casesData);
      setLoading(false);
    });

    // 2. Poll Analytics (or could also be a listener if needed)
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:8000/analytics');
        const json = await res.json();
        setAnalytics(json);
      } catch (err) {
        console.error("Analytics Fetch Error:", err);
      }
    };
    
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000); // 15s polling for stats

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const dashboardStats = [
    { label: t('dashboards.coordinator.activeTasks'), value: '24', icon: <Activity size={20} />, color: 'var(--primary)' },
    { label: t('dashboards.coordinator.impact'), value: '856', icon: <TrendingUp size={20} />, color: 'var(--secondary)' },
    { label: 'Total Volunteers', value: '142', icon: <Users size={20} />, color: 'var(--info)' },
    { label: 'Critical Cases', value: '3', icon: <AlertTriangle size={20} />, color: 'var(--accent)' },
  ];

  const analyticsStats = analytics ? [
    { label: t('analytics.total_needs') || 'Total Needs', value: analytics.total_cases, icon: <AlertTriangle size={20} />, color: 'var(--accent)' },
    { label: t('analytics.avg_urgency') || 'Avg Urgency', value: analytics.avg_urgency + '%', icon: <Activity size={20} />, color: 'var(--info)' },
    { label: t('analytics.active_volunteers') || 'Field Responders', value: analytics.active_volunteers, icon: <Users size={20} />, color: 'var(--primary)' },
    { label: t('analytics.resolution_rate') || 'Success Rate', value: analytics.total_cases > 0 ? Math.round((analytics.statuses.resolved / analytics.total_cases) * 100) + '%' : '0%', icon: <CheckCircle size={20} />, color: '#4ade80' },
  ] : [];

  return (
    <div className="coordinator-dashboard" style={{ padding: '2rem', paddingBottom: '6rem', backgroundColor: 'var(--bg-warm)', minHeight: '100vh', textAlign: 'left' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>{t('dashboards.coordinator.title')}</h1>
          <p style={{ opacity: 0.5, fontSize: '0.9rem', margin: '4px 0 0' }}>Control center for village impact and resource allocation</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <Search size={18} opacity={0.4} />
            <input type="text" placeholder="Search villages..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.9rem', width: '200px' }} />
          </div>
          <button className="glass" style={{ width: '44px', height: '44px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* Row 1: High Level Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass shadow-premium"
            style={{ padding: '1.5rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: 'white' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: `${stat.color}10`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: [Map + Stats] and [Charts] */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Map and Analytics Stats Below it */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* The Map */}
          <div className="glass shadow-premium" style={{ borderRadius: '32px', height: '480px', position: 'relative', overflow: 'hidden', backgroundColor: 'white', border: '1px solid var(--border)' }}>
             <MapContainer center={[19.0760, 72.8777]} zoom={12} style={{ width: '100%', height: '100%', zIndex: 1 }}>
                <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {cases.map(c => (
                  <Marker key={c.id} position={c.coordinates}><Popup>{c.title}</Popup></Marker>
                ))}
              </MapContainer>
          </div>

          {/* Analytics Stats (Total Needs, etc.) - Horizontal Below Map */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {analyticsStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="glass shadow-premium"
                style={{ padding: '1.25rem', borderRadius: '20px', backgroundColor: 'white', border: '1px solid var(--border)' }}
              >
                <div style={{ color: stat.color, marginBottom: '0.75rem', backgroundColor: `${stat.color}10`, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.5, marginTop: '4px' }}>{stat.label.toUpperCase()}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Charts */}
        <div className="glass shadow-premium" style={{ padding: '2rem', borderRadius: '32px', backgroundColor: 'white', border: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--primary)" /> Field Distribution
            </h3>
          </div>
          <ImpactAnalytics data={analytics} loading={loading} showStats={false} />
        </div>
      </div>

      {/* Row 3: Recent Reports */}
      <div className="glass shadow-premium" style={{ marginTop: '2.5rem', padding: '2rem', borderRadius: '32px', backgroundColor: 'white', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Need Reports</h3>
          <button style={{ color: 'var(--primary)', border: 'none', background: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Full History <ChevronRight size={16} />
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {cases.slice(0, 3).map((report) => (
            <div key={report.id} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', borderRadius: '20px', backgroundColor: 'var(--bg-warm)', border: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '2px' }}>{report.location}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 500 }}>{report.title}</div>
              </div>
              <div style={{ 
                padding: '6px 12px', 
                borderRadius: '10px', 
                fontSize: '0.7rem', 
                fontWeight: 900, 
                backgroundColor: 'white', 
                color: report.urgency > 80 ? 'var(--accent)' : 'var(--primary)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {report.urgency > 80 ? 'CRITICAL' : 'STABLE'}
              </div>
            </div>
          ))}
          {cases.length === 0 && !loading && <p style={{ opacity: 0.5, padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>No recent reports found.</p>}
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
