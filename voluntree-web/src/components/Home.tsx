import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Mic,
  Map as MapIcon,
  Zap,
  Users,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Globe,
  ShieldCheck,
  Brain
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

interface HomeProps {
  onGetStarted: (role?: 'worker' | 'volunteer' | 'coordinator') => void;
}

const Home: React.FC<HomeProps> = ({ onGetStarted }) => {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);

  const roles = [
    {
      id: 'worker',
      title: t('roles.worker.title'),
      desc: t('roles.worker.desc'),
      icon: <ShieldCheck size={24} />,
      color: 'var(--primary)'
    },
    {
      id: 'volunteer',
      title: t('roles.volunteer.title'),
      desc: t('roles.volunteer.desc'),
      icon: <Users size={24} />,
      color: 'var(--info)'
    },
    {
      id: 'coordinator',
      title: t('roles.coordinator.title'),
      desc: t('roles.coordinator.desc'),
      icon: <MapIcon size={24} />,
      color: 'var(--secondary)'
    }
  ];

  const features = [
    {
      title: t('features.multimodal.title'),
      desc: t('features.multimodal.desc'),
      icon: <Mic size={24} />,
      color: 'var(--primary)'
    },
    {
      title: t('features.urgency.title'),
      desc: t('features.urgency.desc'),
      icon: <Brain size={24} />,
      color: 'var(--accent)'
    },
    {
      title: t('features.matching.title'),
      desc: t('features.matching.desc'),
      icon: <Users size={24} />,
      color: 'var(--info)'
    },
    {
      title: t('features.offline.title'),
      desc: t('features.offline.desc'),
      icon: <Globe size={24} />,
      color: 'var(--primary-light)'
    }
  ];

  const slides = [
    {
      title: t('slides.villages.title'),
      desc: t('slides.villages.desc'),
      image: "https://assets.traveltriangle.com/blog/wp-content/uploads/2016/11/Mawlynnong.jpg",
      tag: t('slides.villages.tag')
    },
    {
      title: t('slides.intelligence.title'),
      desc: t('slides.intelligence.desc'),
      image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=800",
      tag: t('slides.intelligence.tag')
    },
    {
      title: t('slides.voice.title'),
      desc: t('slides.voice.desc'),
      image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800",
      tag: t('slides.voice.tag')
    }
  ];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="home-container" style={{ width: '100%' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 0',
        marginBottom: '4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', padding: '6px', borderRadius: '8px', color: 'white' }}>
            <MapIcon size={20} />
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, letterSpacing: '-0.02em' }}>{t('nav.title')}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageSelector />
          <button className="secondary" onClick={() => onGetStarted()} style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}>
            {t('nav.signIn')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '100px',
            backgroundColor: 'rgba(30, 122, 71, 0.08)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '2rem'
          }}>
            <Zap size={14} /> {t('hero.newIntegration')}
          </div>
          <h1 style={{ fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
            {t('hero.title')} <br /> <span style={{ color: 'var(--primary)' }}>{t('hero.titleHighlight')}</span>
          </h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
            {t('hero.subtitle')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <button className="primary" onClick={() => onGetStarted()} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px' }}>
              {t('hero.getStarted')} <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </button>
            <button className="secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px' }}>
              {t('hero.watchDemo')}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Carousel Section */}
      <section style={{ marginBottom: '8rem' }}>
        <div style={{ position: 'relative', height: '480px', borderRadius: '40px', overflow: 'hidden' }} className="shadow-premium">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), transparent), url(${slides[activeSlide].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                padding: '4rem'
              }}
            >
              <div style={{ maxWidth: '500px', color: 'white' }}>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {slides[activeSlide].tag}
                </span>
                <h2 style={{ color: 'white', fontSize: '3rem', margin: '1.5rem 0 1rem' }}>{slides[activeSlide].title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.6 }}>{slides[activeSlide].desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <div style={{ position: 'absolute', bottom: '2.5rem', right: '2.5rem', display: 'flex', gap: '1rem' }}>
            <button onClick={prevSlide} style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)', color: 'white',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)', color: 'white',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section style={{ marginBottom: '8rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your Path</h2>
          <p style={{ opacity: 0.6 }}>Select your role and start making an impact in your community.</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {roles.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="glass"
              style={{ 
                padding: '3rem', 
                borderRadius: '32px', 
                border: '1px solid var(--border)',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onClick={() => onGetStarted(r.id as any)}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: 'var(--bg-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: r.color,
                margin: '0 auto 2rem'
              }}>
                {r.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{r.title}</h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>{r.desc}</p>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--primary)', 
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                Join as {r.title} <ArrowRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ marginBottom: '8rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('features.title')}</h2>
          <p style={{ opacity: 0.6 }}>{t('features.subtitle')}</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass"
              style={{ padding: '2.5rem', borderRadius: '28px', border: '1px solid var(--border)' }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: f.color,
                marginBottom: '1.5rem'
              }}>
                {f.icon}
              </div>
              <h3 style={{ marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section style={{
        textAlign: 'center',
        padding: '6rem 4rem',
        backgroundColor: 'var(--primary)',
        borderRadius: '40px',
        color: 'white',
        marginBottom: '4rem'
      }}>
        <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1.5rem' }}>{t('cta.title')}</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 3rem', fontSize: '1.1rem' }}>
          {t('cta.desc')}
        </p>
        <button className="secondary" onClick={() => onGetStarted()} style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '16px', color: 'var(--primary)', fontWeight: 700 }}>
          {t('cta.signUp')}
        </button>
        <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '3rem', opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={18} /> {t('cta.verified')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} /> {t('cta.panIndia')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Brain size={18} /> {t('cta.ethical')}</div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>{t('footer.copy')}</p>
      </footer>
    </div>
  );
};

export default Home;
