import React from 'react';
import ThemeToggle from '../common/ThemeToggle';

interface NavigationProps {
  onBack: () => void;
  onEnter: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onBack, onEnter, theme, onToggleTheme }) => {
  return (
    <nav className="w-full border-b border-dim bg-page/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg border border-dim overflow-hidden">
             <img src="/logo.webp" alt="Mantle" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold text-main tracking-tight font-serif">Mantle</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
              onClick={onBack}
              className="text-sm font-medium text-muted hover:text-main transition-colors hidden sm:block"
          >
              Back to Home
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button 
              onClick={onEnter}
              className="px-4 py-2 bg-accent text-on-accent rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
          >
              Enter App
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
