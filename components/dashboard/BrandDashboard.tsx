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
import { convertToSVG } from '../../utils/vectorUtils';

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
      },
      windowWidth: dashboardRef.current.scrollWidth,
      windowHeight: dashboardRef.current.scrollHeight,
      onclone: (clonedDoc) => {
        // Convert all oklab/oklch colors to RGB for html2canvas compatibility
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const computed = window.getComputedStyle(el as Element);
          const htmlEl = el as HTMLElement;
          
          // Convert color properties from oklab to RGB
          if (computed.color) htmlEl.style.color = computed.color;
          if (computed.backgroundColor) htmlEl.style.backgroundColor = computed.backgroundColor;
          if (computed.borderColor) htmlEl.style.borderColor = computed.borderColor;
          if (computed.borderTopColor) htmlEl.style.borderTopColor = computed.borderTopColor;
          if (computed.borderRightColor) htmlEl.style.borderRightColor = computed.borderRightColor;
          if (computed.borderBottomColor) htmlEl.style.borderBottomColor = computed.borderBottomColor;
          if (computed.borderLeftColor) htmlEl.style.borderLeftColor = computed.borderLeftColor;
          if (computed.outlineColor) htmlEl.style.outlineColor = computed.outlineColor;
        });
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

        // 2. Add Images (PNG and SVG) - Process in parallel for speed
        const assets = zip.folder("sigils");
        const stripBase64 = (dataUrl: string) => dataUrl.split(',')[1];

        // Collect all logo conversion promises
        const conversionPromises: Promise<void>[] = [];

        // Helper to add PNG, transparent PNG, and SVG versions
        const addLogoFiles = async (image: string, baseName: string): Promise<void> => {
            // Add original PNG
            assets?.file(`${baseName}.png`, stripBase64(image), {base64: true});
            
            // Create and add transparent PNG version
            const transparentPromise = processRemoveBackground(image)
                .then(transparentImage => {
                    assets?.file(`${baseName}-transparent.png`, stripBase64(transparentImage), {base64: true});
                })
                .catch(error => {
                    console.error(`Failed to create transparent version of ${baseName}:`, error);
                    // Continue even if transparency fails
                });
            
            // Create SVG version
            const svgPromise = convertToSVG(image)
                .then(svgString => {
                    assets?.file(`${baseName}.svg`, svgString);
                })
                .catch(error => {
                    console.error(`Failed to vectorize ${baseName}:`, error);
                    // Continue even if SVG generation fails
                });
            
            // Wait for both transparent and SVG to complete
            await Promise.all([transparentPromise, svgPromise]);
        };

        // Queue all conversions
        if (logos.primary) {
            conversionPromises.push(addLogoFiles(logos.primary, "primary-sigil"));
        }
        if (logos.secondary) {
            conversionPromises.push(addLogoFiles(logos.secondary, "secondary-crest"));
        }
        variations.forEach((v) => {
            conversionPromises.push(addLogoFiles(v.image, `variation-${v.name}`));
        });

        // Wait for all SVG conversions to complete in parallel
        await Promise.all(conversionPromises);

        // 3. Add comprehensive README with all brand information
        const readme = `# ${data.tagline || 'Brand Identity'} - Mantle Package

> ${data.mission}

---

## 📦 Package Contents

### Brand Assets
- **sigils/** - Logo files in multiple formats
  - Primary Sigil (PNG, PNG-Transparent, SVG)
  - Secondary Crest (PNG, PNG-Transparent, SVG)
  - Logo Variations: Simplified, Monochrome, Outline (PNG, PNG-Transparent, SVG each)

### Brand Data
- **mantle-identity.json** - Complete brand identity data in JSON format
- **mantle.css** - CSS variables and theme configuration
- **README.md** - This comprehensive brand guide

---

## 🎨 Color Palette

${data.colors.map(color => `### ${color.name}
- **Hex:** \`${color.hex}\`
- **Usage:** ${color.usage}
`).join('\n')}

---

## ✍️ Typography

### Header Font
- **Family:** ${data.typography.headerFamily}
- **Weight:** ${data.typography.headerWeight}
- **Usage:** Headings, titles, and brand statements

### Body Font
- **Family:** ${data.typography.bodyFamily}
- **Weight:** ${data.typography.bodyWeight}
- **Usage:** Body text, descriptions, and general content

### Font Pairing Rationale
${data.typography.rationale}

---

## 🌓 Theme Configuration

### Light Theme (Summer Mantle)
- **Background:** \`${data.theme.light.background}\`
- **Surface:** \`${data.theme.light.surface}\`
- **Primary Text:** \`${data.theme.light.textPrimary}\`
- **Secondary Text:** \`${data.theme.light.textSecondary}\`
- **Border:** \`${data.theme.light.border}\`
- **Accent:** \`${data.theme.light.accent}\`

### Dark Theme (Winter Mantle)
- **Background:** \`${data.theme.dark.background}\`
- **Surface:** \`${data.theme.dark.surface}\`
- **Primary Text:** \`${data.theme.dark.textPrimary}\`
- **Secondary Text:** \`${data.theme.dark.textSecondary}\`
- **Border:** \`${data.theme.dark.border}\`
- **Accent:** \`${data.theme.dark.accent}\`

---

## 🚀 Usage Guide

### Using the Logos

**SVG Files (Recommended for Web & Print)**
- Vector graphics that scale infinitely without quality loss
- Perfect for responsive web design, high-DPI displays, and print materials
- Can be styled with CSS (colors, sizes, etc.)

**PNG Files (Raster Images)**
- High-quality bitmap images
- **Standard PNG:** Original logo with background
- **Transparent PNG:** Files ending in \`-transparent.png\` have white backgrounds removed
- Use transparent versions for overlaying on colored backgrounds
- Ideal for social media, presentations, and quick mockups

### Implementing the CSS Theme

1. **Import the CSS file** into your project:
   \\\`\\\`\\\`html
   <link rel="stylesheet" href="mantle.css">
   \\\`\\\`\\\`

2. **Use the CSS variables** in your stylesheets:
   \\\`\\\`\\\`css
   .header {
     font-family: var(--font-header);
     color: var(--text-main);
     background: var(--bg-surface);
   }
   
   .button {
     background: var(--brand-accent);
     color: var(--text-on-accent);
   }
   \\\`\\\`\\\`

3. **Apply theme switching** with media queries (already configured in mantle.css)

### Brand Data JSON

The \`mantle-identity.json\` file contains all brand information in a structured format:
- Colors with hex values and usage guidelines
- Typography specifications
- Theme configurations for light and dark modes
- Logo metadata

Use this file to:
- Import brand data into design tools
- Automate brand asset generation
- Integrate with CMS or documentation systems

---

## 📋 Brand Guidelines

### Logo Usage
- Maintain clear space around logos (minimum 20% of logo height)
- Use Primary Sigil for main branding
- Use Secondary Crest for secondary applications
- Use variations for specific contexts (simplified for small sizes, monochrome for single-color applications)

### Color Application
- Use accent color sparingly for calls-to-action and highlights
- Maintain sufficient contrast ratios for accessibility (WCAG AA minimum)
- Refer to color usage guidelines in the palette section

### Typography Hierarchy
- Use header font for H1-H3 and brand statements
- Use body font for paragraphs, UI elements, and general text
- Maintain consistent font weights across applications

---

## 🛠️ Technical Specifications

- **Logo Formats:** PNG (raster), SVG (vector)
- **Color Space:** RGB (web), Hex codes provided
- **Font Formats:** Google Fonts (web-ready)
- **CSS Framework:** CSS Custom Properties (CSS Variables)
- **Theme Support:** Light and Dark modes with system preference detection

---

## 📄 License & Usage

This brand package was generated by Mantle, powered by Google Gemini AI.
All assets are provided for your use in accordance with your brand identity.

---

**Generated by Mantle** - The Identity Layer for Modern Brands
`;
        zip.file("README.md", readme);

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
        isZipping={isZipping}
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
