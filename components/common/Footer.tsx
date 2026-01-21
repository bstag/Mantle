import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-dim py-8 mt-12 bg-page transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 text-center text-muted text-sm">
        &copy; {new Date().getFullYear()} Stagware. The Mantle Identity Layer.
      </div>
    </footer>
  );
};

export default Footer;
