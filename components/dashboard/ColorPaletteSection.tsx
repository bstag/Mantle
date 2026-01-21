import React from 'react';
import { Color } from '../../types';
import { analyzeContrast } from '../../utils/contrastUtils';

interface ColorPaletteSectionProps {
  colors: Color[];
}

const ColorPaletteSection: React.FC<ColorPaletteSectionProps> = ({ colors }) => {
  return (
    <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
      <h3 className="text-muted mb-8 uppercase tracking-widest text-xs font-semibold border-b border-dim pb-4">Thread & Dye</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {colors.map((color, idx) => {
          const contrastData = analyzeContrast(color.hex);
          return (
            <div key={idx} className="group flex flex-col h-full bg-page rounded-xl overflow-hidden border border-dim shadow-sm hover:border-accent transition-colors">
              <div 
                className="w-full h-32 relative overflow-hidden flex items-end justify-between p-2"
                style={{ backgroundColor: color.hex }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 px-2 py-1 bg-black/10 backdrop-blur-[2px] rounded text-xs font-bold" style={{ color: contrastData.bestText }}>
                  Aa
                </div>

                {!contrastData.isAccessible && (
                  <div className="relative z-10 bg-yellow-500/90 text-white p-1 rounded-md shadow-lg" title={`Low Contrast Ratio: ${contrastData.ratio}:1`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-main font-mono font-bold text-lg">{color.hex}</p>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-accent border border-accent/30 px-1.5 py-0.5 rounded bg-accent/10">{color.usage}</span>
                  </div>
                  <p className="text-main/80 font-medium text-sm leading-tight">{color.name}</p>
                </div>
                
                <div className="space-y-3 pt-3 border-t border-dim flex-1">
                  <div className="text-xs text-muted leading-relaxed">
                    {color.detailedUsage || "Standard application recommended."}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-dim flex items-center justify-between gap-1.5 text-[10px] text-muted font-mono">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="truncate">{color.contrastInfo || "Check Contrast"}</span>
                  </div>
                  <div className={`${contrastData.isAccessible ? 'text-green-500' : 'text-yellow-500'} font-bold`}>
                    {contrastData.ratio}:1
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorPaletteSection;
