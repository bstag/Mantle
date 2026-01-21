import React from 'react';

interface NavbarProps {
  onLogoClick?: () => void;
  onClearKey?: () => void;
  hasApiKey?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onLogoClick, onClearKey, hasApiKey }) => {
  return (
    <nav className="w-full border-b border-dim bg-page/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg border border-dim overflow-hidden">
            <img src="/logo.webp" alt="Mantle Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold text-main tracking-tight font-serif">Mantle</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-muted">
          <span className="hidden sm:inline opacity-70">Stagware Product Suite</span>
          {hasApiKey && (
            <button onClick={onClearKey} className="text-xs hover:text-accent underline">
              Change Key
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
