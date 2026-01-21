import React from 'react';
import { ThemeColors } from '../../types';
import { getContrastRatio } from '../../utils/contrastUtils';

interface MockUIProps {
  theme: ThemeColors;
  title: string;
  logo?: string | null;
  fontFamily: string;
}

const MockUI: React.FC<MockUIProps> = ({ theme, title, logo, fontFamily }) => {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">{title}</h4>
      <div 
        className="rounded-xl overflow-hidden shadow-xl aspect-[3/2] flex flex-col relative transition-all duration-300"
        style={{ backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }}
      >
        <div className="h-12 border-b flex items-center px-4 justify-between" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-current opacity-20" style={{ color: theme.textPrimary }}>
              {logo && <img src={logo} alt="Logo" className="w-full h-full object-contain" />}
            </div>
            <div className="w-16 h-2 rounded bg-current opacity-40" style={{ color: theme.textPrimary }} />
          </div>
          <div className="flex gap-2">
            <div className="w-6 h-2 rounded bg-current opacity-30" style={{ color: theme.textSecondary }} />
            <div className="w-6 h-2 rounded bg-current opacity-30" style={{ color: theme.textSecondary }} />
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-4">
          <div className="w-2/3 h-6 rounded bg-current opacity-90" style={{ color: theme.textPrimary, fontFamily: fontFamily }} />
          <div className="w-full h-3 rounded bg-current opacity-60" style={{ color: theme.textSecondary }} />
          <div className="w-5/6 h-3 rounded bg-current opacity-60" style={{ color: theme.textSecondary }} />
          
          <div className="mt-auto flex gap-3">
            <div 
              className="px-4 py-2 rounded-lg text-xs font-bold"
              style={{ backgroundColor: theme.accent, color: getContrastRatio(theme.accent, '#FFFFFF') > 3 ? '#FFFFFF' : '#000000' }}
            >
              Action
            </div>
            <div 
              className="px-4 py-2 rounded-lg text-xs font-bold border"
              style={{ borderColor: theme.border, color: theme.textPrimary }}
            >
              Detail
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {[
          { label: 'Background', color: theme.background },
          { label: 'Surface', color: theme.surface },
          { label: 'Text', color: theme.textPrimary },
          { label: 'Accent', color: theme.accent },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px] text-muted">
            <div className="w-3 h-3 rounded-full border border-dim shadow-sm" style={{ backgroundColor: item.color }} />
            <span className="font-mono">{item.color}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MockUI;
