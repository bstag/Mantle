import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BrandIdentity, LogoResult, LogoVariation } from '../../types';
import { generateLogoVariations, refineLogo } from '../../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import LogoCard from './LogoCard';
import LogoVariationsSection from './LogoVariationsSection';
import TypographySection from './TypographySection';
import ColorPaletteSection from './ColorPaletteSection';
import ThemePreviewSection from './ThemePreviewSection';
import CSSCodeSection from './CSSCodeSection';
import ModificationModal from './ModificationModal';
import ExportButtons from './ExportButtons';
import { processRemoveBackground } from '../../utils/imageUtils';

interface BrandDashboardProps {
  data: BrandIdentity;
  logos: LogoResult;
  onUpdateLogo?: (type: 'primary' | 'secondary', newImage: string) => void;
  onRegenerateLogo?: (type: 'primary' | 'secondary', feedback?: string) => Promise<void>;
  apiKey: string;
}


const BrandDashboard: React.FC<BrandDashboardProps> = ({ data, logos, onUpdateLogo, onRegenerateLogo, apiKey }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  
  // Local state for variations to allow generating them on demand
  const [variations, setVariations] = useState<LogoVariation[]>(logos.variations || []);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);

  // Modification State
  const [editingTarget, setEditingTarget] = useState<'primary' | 'secondary' | null>(null);
  const [editMode, setEditMode] = useState<'refine' | 'regenerate' | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const MAX_EDIT_PROMPT_LENGTH = 1000;

  // Sync prop changes if they happen upstream
  useEffect(() => {
    if (logos.variations && logos.variations.length > 0) {
        setVariations(logos.variations);
    } else {
        // Reset if primary logo changes and no variations exist yet
        setVariations([]);
    }
  }, [logos.primary, logos.variations]);

  // Dynamically load Google Fonts
  useEffect(() => {
    if (data.typography) {
      const { headerFamily, bodyFamily } = data.typography;
      const linkId = 'dynamic-fonts';
      const existingLink = document.getElementById(linkId);
      if (existingLink) {
        existingLink.remove();
      }

      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      // Basic encoding for font names
      const headerParam = headerFamily.replace(/\s+/g, '+');
      const bodyParam = bodyFamily.replace(/\s+/g, '+');
      link.href = `https://fonts.googleapis.com/css2?family=${headerParam}:wght@400;700&family=${bodyParam}:wght@300;400;500&display=swap`;
      document.head.appendChild(link);
    }
  }, [data.typography]);

  const cssSnippet = useMemo(() => {
    if (!data.theme) return '';
    const toKebab = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    return `:root {
  /* The Royal Script */
  --font-header: '${data.typography.headerFamily}', serif;
  --font-body: '${data.typography.bodyFamily}', sans-serif;

  /* Thread & Dye */
${data.colors.map(c => `  --color-${toKebab(c.name)}: ${c.hex};`).join('\n')}

  /* Summer Mantle (Light) */
  --bg-page: ${data.theme.light.background};
  --bg-surface: ${data.theme.light.surface};
  --text-main: ${data.theme.light.textPrimary};
  --text-muted: ${data.theme.light.textSecondary};
  --border-dim: ${data.theme.light.border};
  --brand-accent: ${data.theme.light.accent};
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Winter Mantle (Dark) */
    --bg-page: ${data.theme.dark.background};
    --bg-surface: ${data.theme.dark.surface};
    --text-main: ${data.theme.dark.textPrimary};
    --text-muted: ${data.theme.dark.textSecondary};
    --border-dim: ${data.theme.dark.border};
    --brand-accent: ${data.theme.dark.accent};
  }
}`;
  }, [data]);

  const generatePdf = async (): Promise<jsPDF | null> => {
    if (!dashboardRef.current) return null;
    
    // Small delay to ensure UI updates before capture
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get current bg color from style to use in PDF capture
    const bg = getComputedStyle(document.body).backgroundColor;

    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2, // High resolution
      useCORS: true, // Allow cross-origin images (like base64 or external)
      backgroundColor: bg, 
      logging: false,
      ignoreElements: (element) => {
        const id = element.id;
        if (id === 'export-btn-container' || id === 'generate-variations-btn') return true;
        if (typeof element.className === 'string' && element.className.includes('reshape-btn')) return true;
        return false;
      }
    });

    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = 595.28; 
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / imgWidth;
    const pdfHeight = imgHeight * ratio;

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const pdf = await generatePdf();
      if (pdf) {
        const cleanTagline = data.tagline ? data.tagline.replace(/[^a-zA-Z0-9]/g, '_') : 'Mantle';
        pdf.save(`${cleanTagline}_Mantle_Guide.pdf`);
      }
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
        const zip = new JSZip();
        const cleanName = data.tagline ? data.tagline.replace(/[^a-zA-Z0-9]/g, '_') : 'Mantle';
        
        // 1. Add Data Files
        zip.file("mantle-identity.json", JSON.stringify(data, null, 2));
        if (cssSnippet) {
            zip.file("mantle.css", cssSnippet);
        }

        // 2. Add Images (strip base64 prefix)
        const assets = zip.folder("sigils");
        const stripBase64 = (dataUrl: string) => dataUrl.split(',')[1];

        if (logos.primary) {
            assets?.file("primary-sigil.png", stripBase64(logos.primary), {base64: true});
        }
        if (logos.secondary) {
            assets?.file("secondary-crest.png", stripBase64(logos.secondary), {base64: true});
        }
        
        variations.forEach((v) => {
            assets?.file(`variation-${v.name}.png`, stripBase64(v.image), {base64: true});
        });

        // 3. Generate PDF and add to zip
        const pdf = await generatePdf();
        if (pdf) {
            const pdfBlob = pdf.output('blob');
            zip.file("mantle-guide.pdf", pdfBlob);
        }

        // 4. Generate Zip Blob
        const content = await zip.generateAsync({type: "blob"});
        
        // 5. Trigger Download
        const url = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cleanName}_Mantle_Package.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (e) {
        console.error("Failed to generate ZIP", e);
        alert("Could not generate zip package.");
    } finally {
        setIsZipping(false);
    }
  };

  const handleGenerateVariations = async () => {
      if (!logos.primary) return;
      setIsGeneratingVariations(true);
      try {
          const newVariations = await generateLogoVariations(apiKey, logos.primary);
          setVariations(newVariations);
      } catch (e) {
          console.error("Failed to generate variations", e);
      } finally {
          setIsGeneratingVariations(false);
      }
  };


  const handleSubmitModification = async () => {
      if (!editingTarget) return;
      
      setIsProcessing(true);
      try {
          if (editMode === 'refine') {
              // Image-to-Image Refinement
              const currentImage = editingTarget === 'primary' ? logos.primary : logos.secondary;
              if (!currentImage) return;

              const refinedImage = await refineLogo(apiKey, currentImage, editPrompt);
              if (refinedImage && onUpdateLogo) {
                  onUpdateLogo(editingTarget, refinedImage);
                  setEditingTarget(null);
                  setEditMode(null);
                  setEditPrompt('');
              }

          } else if (editMode === 'regenerate') {
              // Text-to-Image Regeneration
              if (onRegenerateLogo) {
                  await onRegenerateLogo(editingTarget, editPrompt);
                  setEditingTarget(null);
                  setEditMode(null);
                  setEditPrompt('');
              }
          }
      } catch (error) {
          console.error("Modification failed:", error);
          alert("Failed to modify the sigil. Please try again.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleRemoveBackground = async (type: 'primary' | 'secondary') => {
      const img = type === 'primary' ? logos.primary : logos.secondary;
      if (!img || !onUpdateLogo) return;

      setIsRemovingBg(true);
      try {
          const transparent = await processRemoveBackground(img);
          onUpdateLogo(type, transparent);
      } catch (e) {
          console.error("Failed to remove background", e);
      } finally {
          setIsRemovingBg(false);
      }
  };

  return (
    <div ref={dashboardRef} className="w-full max-w-6xl mx-auto space-y-12 animate-fade-in pb-20 relative p-8 md:p-12 bg-surface/50 rounded-3xl border border-dim shadow-2xl transition-colors duration-300">
      
      {editingTarget && editMode && (
        <ModificationModal
          editMode={editMode}
          editPrompt={editPrompt}
          isProcessing={isProcessing}
          maxLength={MAX_EDIT_PROMPT_LENGTH}
          onPromptChange={setEditPrompt}
          onCancel={() => { setEditingTarget(null); setEditMode(null); setEditPrompt(''); }}
          onSubmit={handleSubmitModification}
        />
      )}

      <ExportButtons
        isExporting={isExporting}
        isZipping={isZipping}
        onExportPdf={handleExportPdf}
        onDownloadZip={handleDownloadZip}
      />

      {/* Header Section */}
      <div className="text-center space-y-6 pt-8">
        <h1 className="text-4xl md:text-6xl font-bold text-main font-serif tracking-tight leading-tight">
          {data.tagline || "The Royal Mantle"}
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-lg italic font-light">
          "{data.mission}"
        </p>
        <div className="flex justify-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium tracking-wide uppercase">
            Voice: {data.brandVoice}
            </div>
        </div>
      </div>

      {/* Main Logos Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <LogoCard
          title="The Sigil (Primary)"
          logo={logos.primary}
          logoType="primary"
          onRefine={onUpdateLogo ? () => { setEditingTarget('primary'); setEditMode('refine'); } : undefined}
          onRegenerate={onRegenerateLogo ? () => { setEditingTarget('primary'); setEditMode('regenerate'); } : undefined}
          onRemoveBackground={handleRemoveBackground}
          isRemovingBg={isRemovingBg}
        />
        <LogoCard
          title="The Crest (Secondary)"
          logo={logos.secondary}
          logoType="secondary"
          onRefine={onUpdateLogo ? () => { setEditingTarget('secondary'); setEditMode('refine'); } : undefined}
          onRegenerate={onRegenerateLogo ? () => { setEditingTarget('secondary'); setEditMode('regenerate'); } : undefined}
          onRemoveBackground={handleRemoveBackground}
          isRemovingBg={isRemovingBg}
        />
      </div>

      <LogoVariationsSection
        variations={variations}
        hasPrimaryLogo={!!logos.primary}
        isGenerating={isGeneratingVariations}
        onGenerateVariations={handleGenerateVariations}
      />

      <TypographySection typography={data.typography} />

      <ColorPaletteSection colors={data.colors} />

      {data.theme && (
        <ThemePreviewSection
          theme={data.theme}
          primaryLogo={logos.primary}
          headerFontFamily={data.typography.headerFamily}
        />
      )}

      {data.theme && cssSnippet && (
        <CSSCodeSection cssSnippet={cssSnippet} />
      )}

    </div>
  );
};

export default BrandDashboard;
