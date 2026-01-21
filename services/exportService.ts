import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { BrandIdentity, LogoResult, LogoVariation } from '../types';
import { processRemoveBackground } from '../utils/imageUtils';
import { convertToSVG } from '../utils/vectorUtils';

/**
 * Generates a PDF from the brand dashboard
 */
export const generateBrandPdf = async (
  dashboardElement: HTMLDivElement
): Promise<jsPDF | null> => {
  if (!dashboardElement) return null;
  
  // Small delay to ensure UI updates before capture
  await new Promise(resolve => setTimeout(resolve, 100));

  // Get current bg color from style to use in PDF capture
  const bg = getComputedStyle(document.body).backgroundColor;

  const canvas = await html2canvas(dashboardElement, {
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
    windowWidth: dashboardElement.scrollWidth,
    windowHeight: dashboardElement.scrollHeight,
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

/**
 * Generates a comprehensive README.md content for the brand package
 */
const generateReadmeContent = (data: BrandIdentity): string => {
  return `# ${data.tagline || 'Brand Identity'} - Mantle Package

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
- **Usage:** Headings, titles, and brand statements

### Body Font
- **Family:** ${data.typography.bodyFamily}
- **Usage:** Body text, descriptions, and general content

### Font Pairing Rationale
${data.typography.reasoning}

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
};

/**
 * Generates and downloads a complete brand package ZIP file
 */
export const generateBrandPackageZip = async (
  data: BrandIdentity,
  logos: LogoResult,
  variations: LogoVariation[],
  cssSnippet: string
): Promise<void> => {
  const zip = new JSZip();
  const cleanName = data.tagline ? data.tagline.replace(/[^a-zA-Z0-9]/g, '_') : 'Mantle';
  
  // 1. Add Data Files
  zip.file("mantle-identity.json", JSON.stringify(data, null, 2));
  if (cssSnippet) {
    zip.file("mantle.css", cssSnippet);
  }

  // 2. Add Images (PNG, Transparent PNG, and SVG) - Process in parallel for speed
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

  // Wait for all conversions to complete in parallel
  await Promise.all(conversionPromises);

  // 3. Add comprehensive README with all brand information
  const readme = generateReadmeContent(data);
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
};
