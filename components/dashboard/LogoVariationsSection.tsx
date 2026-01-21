import React, { useState } from 'react';
import { LogoVariation } from '../../types';
import { downloadImage } from '../../utils/imageUtils';
import { vectorizeAndDownload } from '../../utils/vectorUtils';

interface LogoVariationsSectionProps {
  variations: LogoVariation[];
  hasPrimaryLogo: boolean;
  isGenerating: boolean;
  onGenerateVariations: () => void;
}

const LogoVariationsSection: React.FC<LogoVariationsSectionProps> = ({
  variations,
  hasPrimaryLogo,
  isGenerating,
  onGenerateVariations,
}) => {
  const [vectorizingIndex, setVectorizingIndex] = useState<number | null>(null);

  const handleVectorize = async (image: string, name: string, index: number) => {
    setVectorizingIndex(index);
    try {
      await vectorizeAndDownload(image, name);
    } catch (error) {
      console.error('Vectorization failed:', error);
      alert('Failed to vectorize logo. Please try again.');
    } finally {
      setVectorizingIndex(null);
    }
  };
  return (
    <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-dim pb-4">
        <h3 className="text-muted uppercase tracking-widest text-xs font-semibold">Sigil Variations</h3>
        {variations.length === 0 && hasPrimaryLogo && (
          <button
            id="generate-variations-btn"
            onClick={onGenerateVariations}
            disabled={isGenerating}
            className="text-xs bg-accent hover:opacity-90 text-on-accent px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Forging...
              </>
            ) : (
              'Generate Variations'
            )}
          </button>
        )}
      </div>

      {variations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {variations.map((variant, idx) => (
            <div key={idx} className="flex flex-col items-center group/variant">
              <div className="w-full aspect-square bg-page rounded-xl overflow-hidden flex items-center justify-center p-6 border border-dim relative">
                <img src={variant.image} alt={variant.label} className="w-full h-full object-contain" />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/variant:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => downloadImage(variant.image, `${variant.name}.png`)}
                    className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-semibold transform translate-y-2 group-hover/variant:translate-y-0 transition-all"
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => handleVectorize(variant.image, variant.name, idx)}
                    disabled={vectorizingIndex === idx}
                    className="bg-accent text-on-accent px-3 py-1.5 rounded-full text-xs font-semibold transform translate-y-2 group-hover/variant:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {vectorizingIndex === idx ? (
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    SVG
                  </button>
                </div>
              </div>
              <span className="text-muted text-sm mt-3 font-medium">{variant.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-dim rounded-xl">
          <p className="text-muted text-sm">
            {hasPrimaryLogo ? "Forge simplified, monochrome, and outline versions of your Sigil." : "Wait for the Sigil to complete."}
          </p>
        </div>
      )}
    </div>
  );
};

export default LogoVariationsSection;
