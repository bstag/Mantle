
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BrandIdentity, LogoResult, LogoVariation, ThemeColors } from '../types';
import { generateLogoVariations, refineLogo } from '../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

interface BrandDashboardProps {
  data: BrandIdentity;
  logos: LogoResult;
  onUpdateLogo?: (type: 'primary' | 'secondary', newImage: string) => void;
  apiKey: string;
}

// Contrast Helper Functions
const getLuminance = (hex: string) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
  const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

  const [lr, lg, lb] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const getContrastRatio = (hex1: string, hex2: string) => {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

const analyzeContrast = (bgHex: string) => {
  // Validate hex
  if (!/^#[0-9A-F]{6}$/i.test(bgHex)) return { isAccessible: true, ratio: 21, bestText: '#FFFFFF' };

  const whiteContrast = getContrastRatio(bgHex, '#FFFFFF');
  const blackContrast = getContrastRatio(bgHex, '#000000');
  
  const bestText = whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
  const maxRatio = Math.max(whiteContrast, blackContrast);
  
  return {
    isAccessible: maxRatio >= 4.5, // WCAG AA for normal text
    ratio: maxRatio.toFixed(2),
    bestText
  };
};

// UI Preview Component
const MockUI: React.FC<{ theme: ThemeColors, title: string, logo?: string | null, fontFamily: string }> = ({ theme, title, logo, fontFamily }) => {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">{title}</h4>
      <div 
        className="rounded-xl overflow-hidden shadow-xl aspect-[3/2] flex flex-col relative transition-all duration-300"
        style={{ backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }}
      >
        {/* Mock Nav */}
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
        
        {/* Mock Body */}
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

      {/* Hex Codes Legend */}
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

const BrandDashboard: React.FC<BrandDashboardProps> = ({ data, logos, onUpdateLogo, apiKey }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);
  
  // Local state for variations to allow generating them on demand
  const [variations, setVariations] = useState<LogoVariation[]>(logos.variations || []);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);

  // Modification State
  const [editingTarget, setEditingTarget] = useState<'primary' | 'secondary' | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

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

  const downloadImage = (dataUrl: string, filename: string) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleCopyCss = () => {
      navigator.clipboard.writeText(cssSnippet);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleRefineSubmit = async () => {
      if (!editingTarget || !editPrompt.trim()) return;
      
      const currentImage = editingTarget === 'primary' ? logos.primary : logos.secondary;
      if (!currentImage) return;

      setIsRefining(true);
      try {
          const refinedImage = await refineLogo(apiKey, currentImage, editPrompt);
          if (refinedImage && onUpdateLogo) {
              onUpdateLogo(editingTarget, refinedImage);
              setEditingTarget(null);
              setEditPrompt('');
          }
      } catch (error) {
          console.error("Refinement failed:", error);
          alert("Failed to reshape the sigil. Please try again.");
      } finally {
          setIsRefining(false);
      }
  };

  return (
    <div ref={dashboardRef} className="w-full max-w-6xl mx-auto space-y-12 animate-fade-in pb-20 relative p-8 md:p-12 bg-surface/50 rounded-3xl border border-dim shadow-2xl transition-colors duration-300">
      
      {/* Modification Modal */}
      {editingTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-surface border border-dim p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
                  <h3 className="text-xl font-bold text-main mb-2 font-serif">Reshape Sigil</h3>
                  <p className="text-muted text-sm mb-6">Describe how the Mantle should be altered. The threads will be re-woven.</p>
                  
                  <textarea 
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="E.g., Make it blue, add a crown, remove the circle..."
                    className="w-full bg-page border border-dim rounded-lg p-3 text-main placeholder-muted focus:ring-2 focus:ring-accent outline-none resize-none h-32 mb-6"
                    autoFocus
                  />
                  
                  <div className="flex gap-4">
                      <button 
                        onClick={() => { setEditingTarget(null); setEditPrompt(''); }}
                        disabled={isRefining}
                        className="flex-1 py-2 rounded-lg border border-dim text-muted hover:bg-page transition-colors text-sm font-medium"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleRefineSubmit}
                        disabled={isRefining || !editPrompt.trim()}
                        className="flex-1 py-2 rounded-lg bg-accent text-on-accent hover:opacity-90 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isRefining ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Reshaping...
                              </>
                          ) : (
                              'Weave Changes'
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Export Button Container */}
      <div id="export-btn-container" className="absolute top-8 right-8 z-10 flex gap-3">
        {/* PDF Export */}
        <button
          onClick={handleExportPdf}
          disabled={isExporting || isZipping}
          className="flex items-center gap-2 bg-surface hover:bg-page text-muted hover:text-main px-4 py-2 rounded-lg border border-dim transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download PDF Guide"
        >
          {isExporting ? (
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          )}
          <span className="hidden sm:inline">{isExporting ? "PDF..." : "PDF Guide"}</span>
        </button>

        {/* ZIP Download */}
        <button
          onClick={handleDownloadZip}
          disabled={isExporting || isZipping}
          className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-lg border border-accent/20 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download All Assets (ZIP)"
        >
          {isZipping ? (
             <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V3m0 0l-3 3m3-3l3 3m-6 8h6" /></svg>
          )}
          <span className="hidden sm:inline">{isZipping ? "Packaging..." : "Download Mantle"}</span>
        </button>
      </div>

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
        <div className="bg-surface rounded-2xl p-6 border border-dim flex flex-col items-center backdrop-blur-sm relative group/card">
          <h3 className="text-muted mb-6 uppercase tracking-widest text-xs font-semibold">The Sigil (Primary)</h3>
          <div className="w-full aspect-square bg-page rounded-xl overflow-hidden flex items-center justify-center border border-dim shadow-inner relative group/image">
             {logos.primary ? (
               <>
                <img src={logos.primary} alt="Primary Sigil" className="w-full h-full object-contain p-8 group-hover/image:scale-105 transition-transform duration-500" />
                {onUpdateLogo && (
                  <button 
                    onClick={() => setEditingTarget('primary')}
                    className="reshape-btn absolute top-3 right-3 bg-accent/90 hover:bg-accent text-on-accent p-2 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity shadow-lg"
                    title="Reshape Sigil"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
               </>
             ) : (
               <div className="text-muted font-mono text-sm animate-pulse">Forging Sigil...</div>
             )}
          </div>
          {logos.primary && (
            <button 
                onClick={() => downloadImage(logos.primary!, 'Primary_Sigil.png')}
                className="mt-4 px-4 py-2 bg-dim hover:bg-muted/20 text-main text-xs rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-2"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PNG
            </button>
          )}
        </div>
        
        <div className="bg-surface rounded-2xl p-6 border border-dim flex flex-col items-center backdrop-blur-sm relative group/card">
          <h3 className="text-muted mb-6 uppercase tracking-widest text-xs font-semibold">The Crest (Secondary)</h3>
          <div className="w-full aspect-square bg-page rounded-xl overflow-hidden flex items-center justify-center border border-dim shadow-inner relative group/image">
            {logos.secondary ? (
               <>
                <img src={logos.secondary} alt="Secondary Crest" className="w-full h-full object-contain p-12 group-hover/image:scale-105 transition-transform duration-500" />
                {onUpdateLogo && (
                  <button 
                    onClick={() => setEditingTarget('secondary')}
                    className="reshape-btn absolute top-3 right-3 bg-accent/90 hover:bg-accent text-on-accent p-2 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity shadow-lg"
                    title="Reshape Crest"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
               </>
             ) : (
                <div className="text-muted font-mono text-sm animate-pulse">Forging Crest...</div>
             )}
          </div>
           {logos.secondary && (
            <button 
                onClick={() => downloadImage(logos.secondary!, 'Secondary_Crest.png')}
                className="mt-4 px-4 py-2 bg-dim hover:bg-muted/20 text-main text-xs rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-2"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PNG
            </button>
          )}
        </div>
      </div>

      {/* Logo Variations Section */}
      <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-dim pb-4">
             <h3 className="text-muted uppercase tracking-widest text-xs font-semibold">Sigil Variations</h3>
             {variations.length === 0 && logos.primary && (
                 <button
                    id="generate-variations-btn"
                    onClick={handleGenerateVariations}
                    disabled={isGeneratingVariations}
                    className="text-xs bg-accent hover:opacity-90 text-on-accent px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                 >
                     {isGeneratingVariations ? (
                         <>
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
                             
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/variant:opacity-100 transition-opacity flex items-center justify-center">
                                 <button
                                     onClick={() => downloadImage(variant.image, `${variant.name}.png`)}
                                     className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-semibold transform translate-y-2 group-hover/variant:translate-y-0 transition-all"
                                 >
                                     Download
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
                     {logos.primary ? "Forge simplified, monochrome, and outline versions of your Sigil." : "Wait for the Sigil to complete."}
                 </p>
             </div>
         )}
      </div>

      {/* Typography Section */}
      <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
         <h3 className="text-muted mb-8 uppercase tracking-widest text-xs font-semibold border-b border-dim pb-4">The Royal Script</h3>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className="flex items-baseline justify-between border-b border-dashed border-dim pb-2">
                    <span className="text-accent text-sm font-medium">Header Font</span>
                    <span className="text-muted font-mono text-xs bg-page px-2 py-1 rounded">{data.typography.headerFamily}</span>
                </div>
                <div 
                    className="text-5xl md:text-6xl text-main leading-tight break-words"
                    style={{ fontFamily: `'${data.typography.headerFamily}', serif` }}
                >
                    The Heavy Crown
                </div>
                <div 
                    className="text-3xl text-muted"
                    style={{ fontFamily: `'${data.typography.headerFamily}', serif` }}
                >
                    Aa Bb Cc Dd Ee 123
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-baseline justify-between border-b border-dashed border-dim pb-2">
                    <span className="text-accent text-sm font-medium">Body Font</span>
                    <span className="text-muted font-mono text-xs bg-page px-2 py-1 rounded">{data.typography.bodyFamily}</span>
                </div>
                <p 
                    className="text-lg text-main/80 leading-relaxed"
                    style={{ fontFamily: `'${data.typography.bodyFamily}', sans-serif` }}
                >
                    {data.typography.reasoning} 
                </p>
                <div 
                    className="text-sm text-muted tracking-wider break-all"
                    style={{ fontFamily: `'${data.typography.bodyFamily}', sans-serif` }}
                >
                    abcdefghijklmnopqrstuvwxyz 0123456789 (!@#$%)
                </div>
            </div>
         </div>
      </div>

      {/* Color Palette Section */}
      <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
        <h3 className="text-muted mb-8 uppercase tracking-widest text-xs font-semibold border-b border-dim pb-4">Thread & Dye</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {data.colors.map((color, idx) => {
                const contrastData = analyzeContrast(color.hex);
                return (
                <div key={idx} className="group flex flex-col h-full bg-page rounded-xl overflow-hidden border border-dim shadow-sm hover:border-accent transition-colors">
                    <div 
                        className="w-full h-32 relative overflow-hidden flex items-end justify-between p-2"
                        style={{ backgroundColor: color.hex }}
                    >
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         
                         {/* Visual Contrast Preview */}
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
                             {/* Display Calculated Ratio */}
                             <div className={`${contrastData.isAccessible ? 'text-green-500' : 'text-yellow-500'} font-bold`}>
                                 {contrastData.ratio}:1
                             </div>
                        </div>
                    </div>
                </div>
            )})}
        </div>
      </div>

      {/* UI Theme Application Section */}
      {data.theme && (
        <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
           <h3 className="text-muted mb-8 uppercase tracking-widest text-xs font-semibold border-b border-dim pb-4">Seasonal Mantles</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <MockUI 
                theme={data.theme.light} 
                title="Summer Mantle (Light)" 
                logo={logos.primary}
                fontFamily={data.typography.headerFamily} 
              />
              <MockUI 
                theme={data.theme.dark} 
                title="Winter Mantle (Dark)" 
                logo={logos.primary}
                fontFamily={data.typography.headerFamily} 
              />
           </div>
        </div>
      )}

      {/* CSS Code Snippet Section */}
      {data.theme && cssSnippet && (
        <div className="bg-surface rounded-2xl p-8 border border-dim backdrop-blur-sm">
           <div className="flex items-center justify-between mb-6 border-b border-dim pb-4">
               <h3 className="text-muted uppercase tracking-widest text-xs font-semibold">Stitching Pattern (CSS)</h3>
               <button 
                  onClick={handleCopyCss}
                  className="text-xs bg-dim hover:bg-muted text-main px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
               >
                   {copiedCss ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-green-500">Copied!</span>
                      </>
                   ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        <span>Copy Pattern</span>
                      </>
                   )}
               </button>
           </div>
           
           <div className="relative rounded-xl overflow-hidden bg-page border border-dim shadow-inner group">
              <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-main">
                  <code dangerouslySetInnerHTML={{ __html: cssSnippet.replace(/\n/g, '<br/>').replace(/\s\s/g, '&nbsp;&nbsp;') }} />
              </pre>
           </div>
           <p className="text-xs text-muted mt-4 text-center">
             Weave this into your application's global styles.
           </p>
        </div>
      )}

    </div>
  );
};

export default BrandDashboard;
