import React from 'react';
import { downloadImage } from '../../utils/imageUtils';

interface LogoCardProps {
  title: string;
  logo: string | null;
  logoType: 'primary' | 'secondary';
  onRefine?: () => void;
  onRegenerate?: () => void;
  onRemoveBackground: (type: 'primary' | 'secondary') => void;
  isRemovingBg: boolean;
}

const LogoCard: React.FC<LogoCardProps> = ({
  title,
  logo,
  logoType,
  onRefine,
  onRegenerate,
  onRemoveBackground,
  isRemovingBg,
}) => {
  const padding = logoType === 'primary' ? 'p-8' : 'p-12';
  const filename = logoType === 'primary' ? 'Primary_Sigil.png' : 'Secondary_Crest.png';

  return (
    <div className="bg-surface rounded-2xl p-6 border border-dim flex flex-col items-center backdrop-blur-sm relative group/card">
      <h3 className="text-muted mb-6 uppercase tracking-widest text-xs font-semibold">{title}</h3>
      <div className="w-full aspect-square bg-page rounded-xl overflow-hidden flex items-center justify-center border border-dim shadow-inner relative group/image">
        {logo ? (
          <>
            <img src={logo} alt={title} className={`w-full h-full object-contain ${padding} group-hover/image:scale-105 transition-transform duration-500`} />
            <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 transition-opacity">
              {onRefine && (
                <button 
                  onClick={onRefine}
                  className="reshape-btn bg-accent/90 hover:bg-accent text-on-accent p-2 rounded-full shadow-lg"
                  title="Refine (Edit Existing)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
              {onRegenerate && (
                <button 
                  onClick={onRegenerate}
                  className="reshape-btn bg-dim hover:bg-muted text-main p-2 rounded-full shadow-lg border border-muted/20"
                  title="Regenerate (Create New)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-muted font-mono text-sm animate-pulse">
            Forging {logoType === 'primary' ? 'Sigil' : 'Crest'}...
          </div>
        )}
      </div>
      {logo && (
        <div className="flex items-center gap-2 mt-4">
          <button 
            onClick={() => downloadImage(logo, filename)}
            className="px-4 py-2 bg-dim hover:bg-muted/20 text-main text-xs rounded-full transition-opacity flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            PNG
          </button>
          <button 
            onClick={() => onRemoveBackground(logoType)}
            disabled={isRemovingBg}
            className="px-4 py-2 bg-dim hover:bg-muted/20 text-main text-xs rounded-full transition-opacity flex items-center gap-2"
            title="Make White Transparent (Magic Wand)"
          >
            {isRemovingBg ? (
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            )}
            Remove BG
          </button>
        </div>
      )}
    </div>
  );
};

export default LogoCard;
