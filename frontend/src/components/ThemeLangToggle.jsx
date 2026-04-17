import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const ThemeLangToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <button 
        onClick={toggleLanguage} 
        style={{
          background: 'transparent', 
          border: '1px solid var(--glass-border)', 
          color: 'var(--text-main)', 
          cursor: 'pointer', 
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.2s',
          backgroundColor: 'var(--glass-bg)'
        }}
        title={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
      >
        <Globe size={18} />
        {language.toUpperCase()}
      </button>

      <button 
        onClick={toggleTheme} 
        style={{
          background: 'transparent', 
          border: '1px solid var(--glass-border)', 
          color: 'var(--text-main)', 
          cursor: 'pointer', 
          padding: '0.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          backgroundColor: 'var(--glass-bg)'
        }}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
};

export default ThemeLangToggle;
