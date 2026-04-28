import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Cloud, AlertCircle, ChevronDown, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Report {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'synced' | 'queued' | 'failed';
  icon: string;
  lat?: string;
  lng?: string;
}

const SubmissionHistory: React.FC<{ queueUpdated?: number }> = ({ queueUpdated }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchReports = () => {
      const queue = JSON.parse(localStorage.getItem('offline_reports') || '[]');
      // Mock some synced reports for UI demonstration
      const synced: Report[] = [
        {
          id: '1',
          type: 'water',
          description: 'Broken pump in Sector 2',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'synced',
          icon: '💧',
          lat: '19.0760',
          lng: '72.8777'
        },
        {
          id: '2',
          type: 'medical',
          description: 'Medicine shortage at clinic',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          status: 'synced',
          icon: '💊',
          lat: '19.0800',
          lng: '72.8800'
        }
      ];
      setReports([...queue, ...synced]);
    };

    fetchReports();
  }, [queueUpdated]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'synced': return t('history.synced');
      case 'queued': return t('history.queued');
      case 'failed': return t('history.failed');
      default: return status;
    }
  };

  return (
    <div className="submission-history" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{t('history.title')}</h3>
        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{reports.length} total</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass"
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: report.status === 'queued' ? '1px solid rgba(255, 165, 0, 0.3)' : '1px solid transparent',
                backgroundColor: 'var(--bg-white)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div 
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '1.5rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-warm)', borderRadius: '12px' }}>
                  {report.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>
                    {t(`capture.categories.${report.type}`)}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {new Date(report.timestamp).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    color: report.status === 'synced' ? 'var(--primary)' : 'orange',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'flex-end',
                    marginBottom: '4px'
                  }}>
                    {report.status === 'synced' ? <CheckCircle2 size={12} /> : <Cloud size={12} />}
                    {getStatusLabel(report.status).toUpperCase()}
                  </div>
                  <ChevronDown size={16} style={{ transform: expandedId === report.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', opacity: 0.3 }} />
                </div>
              </div>

              <AnimatePresence>
                {expandedId === report.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.02)' }}
                  >
                    <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', fontSize: '0.85rem' }}>
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                        <p style={{ margin: '0 0 1rem 0', lineHeight: 1.5, opacity: 0.8 }}>{report.description}</p>
                        <div style={{ display: 'flex', gap: '1rem', opacity: 0.6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} /> {report.lat}, {report.lng}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={14} /> ID: {report.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubmissionHistory;
