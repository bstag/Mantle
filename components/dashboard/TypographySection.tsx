import React from 'react';
import { FontPairing } from '../../types';

interface TypographySectionProps {
  typography: FontPairing;
}

const TypographySection: React.FC<TypographySectionProps> = ({ typography }) => {
  return (
    <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
      <h3 className="text-muted mb-8 uppercase tracking-widest text-xs font-semibold border-b border-dim pb-4">The Royal Script</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-dashed border-dim pb-2">
            <span className="text-accent text-sm font-medium">Header Font</span>
            <span className="text-muted font-mono text-xs bg-page px-2 py-1 rounded">{typography.headerFamily}</span>
          </div>
          <div 
            className="text-5xl md:text-6xl text-main leading-tight break-words"
            style={{ fontFamily: `'${typography.headerFamily}', serif` }}
          >
            The Heavy Crown
          </div>
          <div 
            className="text-3xl text-muted"
            style={{ fontFamily: `'${typography.headerFamily}', serif` }}
          >
            Aa Bb Cc Dd Ee 123
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-dashed border-dim pb-2">
            <span className="text-accent text-sm font-medium">Body Font</span>
            <span className="text-muted font-mono text-xs bg-page px-2 py-1 rounded">{typography.bodyFamily}</span>
          </div>
          <p 
            className="text-lg text-main/80 leading-relaxed"
            style={{ fontFamily: `'${typography.bodyFamily}', sans-serif` }}
          >
            {typography.reasoning} 
          </p>
          <div 
            className="text-sm text-muted tracking-wider break-all"
            style={{ fontFamily: `'${typography.bodyFamily}', sans-serif` }}
          >
            abcdefghijklmnopqrstuvwxyz 0123456789 (!@#$%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographySection;
