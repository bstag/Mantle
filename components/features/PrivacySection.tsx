import React from 'react';

interface PrivacySectionProps {
  onEnter: () => void;
}

const PrivacySection: React.FC<PrivacySectionProps> = ({ onEnter }) => {
  return (
    <section className="bg-surface border border-dim rounded-3xl p-12 text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 text-on-accent shadow-lg">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold font-serif mb-4">Sovereign Data</h2>
      <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
        Mantle operates on a <strong>Bring Your Own Key (BYOK)</strong> model. Your Gemini API key is stored locally in your browser's encrypted storage. We do not run a backend server that sees your keys. You are the sole sovereign of your data.
      </p>
      <button 
        onClick={onEnter}
        className="px-8 py-4 bg-accent text-on-accent rounded-lg font-bold text-lg shadow-xl hover:scale-105 transition-transform duration-200"
      >
        Start Weaving
      </button>
    </section>
  );
};

export default PrivacySection;
