import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' }
];

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === (i18n.language?.split('-')[0] || 'en')) || LANGUAGES[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="secondary"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '0.6rem 1.25rem',
          fontSize: '0.9rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          backgroundColor: 'white',
          cursor: 'pointer',
          minWidth: '120px',
          justifyContent: 'center'
        }}
        aria-label="Select Language"
      >
        <Globe size={18} />
        {currentLang.label}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          minWidth: '160px',
          zIndex: 100,
          overflow: 'hidden',
          border: '1px solid var(--border)'
        }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                backgroundColor: (i18n.language?.split('-')[0] || 'en') === lang.code ? 'var(--bg-warm)' : 'transparent',
                border: 'none',
                borderBottom: lang.code !== LANGUAGES[LANGUAGES.length - 1].code ? '1px solid var(--border)' : 'none',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'block',
                color: 'var(--text)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-warm)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = (i18n.language?.split('-')[0] || 'en') === lang.code ? 'var(--bg-warm)' : 'transparent')}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
