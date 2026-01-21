import React, { useState } from 'react';

interface CSSCodeSectionProps {
  cssSnippet: string;
}

const CSSCodeSection: React.FC<CSSCodeSectionProps> = ({ cssSnippet }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 border-b border-dim pb-4">
        <h3 className="text-muted uppercase tracking-widest text-xs font-semibold">Stitching Pattern (CSS)</h3>
        <button 
          onClick={handleCopy}
          className="text-xs bg-dim hover:bg-muted text-main px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Pattern</span>
            </>
          )}
        </button>
      </div>
      
      <div className="relative rounded-xl overflow-hidden bg-page border border-dim shadow-inner group">
        <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-main whitespace-pre-wrap">
          <code>{cssSnippet}</code>
        </pre>
      </div>
      <p className="text-xs text-muted mt-4 text-center">
        Weave this into your application&apos;s global styles.
      </p>
    </div>
  );
};

export default CSSCodeSection;
