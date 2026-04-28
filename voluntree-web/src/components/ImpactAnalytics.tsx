import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, AlertTriangle, CheckCircle, PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AnalyticsData {
  total_cases: number;
  categories: Record<string, number>;
  statuses: { pending: number; assigned: number; resolved: number };
  avg_urgency: number;
  active_volunteers: number;
}

interface ImpactAnalyticsProps {
  data?: AnalyticsData | null;
  loading?: boolean;
  showStats?: boolean;
}

const ImpactAnalytics: React.FC<ImpactAnalyticsProps> = ({ data: propsData, loading: propsLoading, showStats = true }) => {
  const { t } = useTranslation();
  const [internalData, setInternalData] = useState<AnalyticsData | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    if (propsData) return;
    
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:8000/analytics');
        const json = await res.json();
        setInternalData(json);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setInternalLoading(false);
      }
    };

    fetchAnalytics();
  }, [propsData]);

  const data = propsData || internalData;
  const loading = propsData ? propsLoading : internalLoading;

  if (loading || !data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Activity className="spin" size={32} color="var(--primary)" />
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600, opacity: 0.5 }}>{t('analytics.loading') || "Analyzing..."}</p>
      </div>
    );
  }

  const maxCatValue = Math.max(...Object.values(data.categories), 1);

  const statCards = [
    { label: t('analytics.total_needs') || 'Total Needs', value: data.total_cases, icon: <AlertTriangle size={20} />, color: 'var(--accent)' },
    { label: t('analytics.avg_urgency') || 'Avg Urgency', value: data.avg_urgency + '%', icon: <Activity size={20} />, color: 'var(--info)' },
    { label: t('analytics.active_volunteers') || 'Active Volunteers', value: data.active_volunteers, icon: <Users size={20} />, color: 'var(--primary)' },
    { label: t('analytics.resolution_rate') || 'Resolution Rate', value: data.total_cases > 0 ? Math.round((data.statuses.resolved / data.total_cases) * 100) + '%' : '0%', icon: <CheckCircle size={20} />, color: '#4ade80' },
  ];

  return (
    <div className="impact-analytics-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Top Stats Cards */}
      {showStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', width: '100%' }}>
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass shadow-premium"
              style={{ padding: '1.25rem', borderRadius: '20px', backgroundColor: 'white', textAlign: 'left' }}
            >
              <div style={{ color: stat.color, marginBottom: '0.5rem', backgroundColor: `${stat.color}15`, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.5, letterSpacing: '0.05em' }}>{stat.label.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        {/* Category Breakdown */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'left' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem' }}>
              <BarChart3 size={18} color="var(--primary)" /> {t('analytics.issue_distribution')}
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(data.categories).map(([cat, val]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span>{cat}</span>
                  <span style={{ opacity: 0.5 }}>{val}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-warm)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(val / maxCatValue) * 100}%` }}
                    transition={{ duration: 1 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--info) 100%)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem' }}>
              <PieChartIcon size={18} color="var(--primary)" /> {t('analytics.case_status')}
            </h4>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <svg width="120" height="120" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#F1F5F9" strokeWidth="20" />
              <motion.circle 
                cx="100" cy="100" r="80" fill="none" stroke="var(--primary)" strokeWidth="20"
                strokeDasharray={`${data.total_cases > 0 ? (data.statuses.resolved / data.total_cases) * 502 : 0} 502`}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 502" }}
                animate={{ strokeDasharray: `${data.total_cases > 0 ? (data.statuses.resolved / data.total_cases) * 502 : 0} 502` }}
                transition={{ duration: 1.5 }}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{data.statuses.resolved}</div>
              <div style={{ fontSize: '0.5rem', fontWeight: 700, opacity: 0.5 }}>RESOLVED</div>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(data.statuses).map(([status, val]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: status === 'resolved' ? 'var(--primary)' : (status === 'assigned' ? 'var(--info)' : 'orange') }} />
                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{status}</span>
                <span style={{ marginLeft: 'auto', opacity: 0.5, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImpactAnalytics;
