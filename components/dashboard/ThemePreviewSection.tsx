import React from 'react';
import { BrandIdentity } from '../../types';
import MockUI from './MockUI';

interface ThemePreviewSectionProps {
  theme: BrandIdentity['theme'];
  primaryLogo?: string | null;
  headerFontFamily: string;
}

const ThemePreviewSection: React.FC<ThemePreviewSectionProps> = ({ theme, primaryLogo, headerFontFamily }) => {
  return (
    <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
      <h3 className="text-muted mb-8 uppercase tracking-widest text-xs font-semibold border-b border-dim pb-4">Seasonal Mantles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <MockUI 
          theme={theme.light} 
          title="Summer Mantle (Light)" 
          logo={primaryLogo}
          fontFamily={headerFontFamily} 
        />
        <MockUI 
          theme={theme.dark} 
          title="Winter Mantle (Dark)" 
          logo={primaryLogo}
          fontFamily={headerFontFamily} 
        />
      </div>
    </div>
  );
};

export default ThemePreviewSection;
