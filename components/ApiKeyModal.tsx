
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const validateApiKey = (apiKey: string): boolean => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError('API key is required');
      return false;
    }
    if (!trimmedKey.startsWith('AIza')) {
      setError('Invalid API key format. Google API keys start with "AIza"');
      return false;
    }
    if (trimmedKey.length < 39) {
      setError('API key appears too short. Please check and try again');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateApiKey(key)) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-page/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-dim p-8 rounded-2xl shadow-2xl relative">
        <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg border border-dim">
                <svg className="w-6 h-6 text-on-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h2 className="text-2xl font-bold font-serif text-main">Authenticate</h2>
            <p className="text-muted text-sm mt-2">
                Mantle requires your own Gemini API Key. It is stored locally in your browser and never sent to our servers.
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(''); }}
              placeholder="Paste API Key (AIzaSy...)"
              className="w-full bg-page border border-dim rounded-lg p-3 text-main outline-none focus:ring-2 focus:ring-accent transition-all placeholder-muted/50 text-sm font-mono"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </p>
            )}
          </div>
          <button 
            type="submit"
            disabled={!key.trim()}
            className="w-full py-3 bg-accent text-on-accent rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-lg"
          >
            Enter the Mantle
          </button>
          
          <div className="text-center pt-2">
            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-muted hover:text-accent transition-colors border-b border-transparent hover:border-accent"
            >
                Get a free key from Google AI Studio &rarr;
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
