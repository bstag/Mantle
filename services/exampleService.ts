import { BrandIdentity, LogoResult, LogoVariation } from '../types';

export interface ExampleBrand {
  id: string;
  name: string;
  description: string;
  folder: string;
}

export interface ExampleIndex {
  examples: ExampleBrand[];
}

export interface LoadedExample {
  identity: BrandIdentity;
  logos: LogoResult;
  css: string;
}

const EXAMPLES_BASE_PATH = '/examples';

/**
 * Fetches the index of available example brands
 */
export const fetchExampleIndex = async (): Promise<ExampleIndex> => {
  const response = await fetch(`${EXAMPLES_BASE_PATH}/index.json`);
  if (!response.ok) {
    throw new Error('Failed to load examples index');
  }
  return response.json();
};

/**
 * Loads a complete example brand package by folder name
 */
export const loadExample = async (folder: string): Promise<LoadedExample> => {
  const basePath = `${EXAMPLES_BASE_PATH}/${folder}`;

  // Load identity JSON
  const identityResponse = await fetch(`${basePath}/mantle-identity.json`);
  if (!identityResponse.ok) {
    throw new Error(`Failed to load identity for example: ${folder}`);
  }
  const identity: BrandIdentity = await identityResponse.json();

  // Load CSS
  const cssResponse = await fetch(`${basePath}/mantle.css`);
  const css = cssResponse.ok ? await cssResponse.text() : '';

  // Load logos - try to load each, return null if not found
  const loadImage = async (filename: string): Promise<string | null> => {
    try {
      const response = await fetch(`${basePath}/sigils/${filename}`);
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // Load primary and secondary logos
  const [primary, secondary] = await Promise.all([
    loadImage('primary-sigil.png'),
    loadImage('secondary-crest.png'),
  ]);

  // Load variations
  const variationNames = ['simplified', 'monochrome', 'outline'];
  const variationPromises = variationNames.map(async (name): Promise<LogoVariation | null> => {
    const image = await loadImage(`variation-${name}.png`);
    if (!image) return null;
    return {
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      image,
    };
  });

  const variationResults = await Promise.all(variationPromises);
  const variations = variationResults.filter((v): v is LogoVariation => v !== null);

  return {
    identity,
    logos: {
      primary,
      secondary,
      variations,
    },
    css,
  };
};

/**
 * Downloads an example as a ZIP file (re-packages from loaded data)
 */
export const downloadExampleZip = async (folder: string): Promise<void> => {
  // Import dynamically to avoid loading JSZip unless needed
  const JSZip = (await import('jszip')).default;
  
  const basePath = `${EXAMPLES_BASE_PATH}/${folder}`;
  const zip = new JSZip();

  // Helper to fetch and add file to zip
  const addFileToZip = async (filename: string, zipPath?: string) => {
    try {
      const response = await fetch(`${basePath}/${filename}`);
      if (response.ok) {
        const content = await response.text();
        zip.file(zipPath || filename, content);
      }
    } catch {
      // Skip files that don't exist
    }
  };

  const addBinaryToZip = async (filename: string, zipPath?: string) => {
    try {
      const response = await fetch(`${basePath}/${filename}`);
      if (response.ok) {
        const blob = await response.blob();
        zip.file(zipPath || filename, blob);
      }
    } catch {
      // Skip files that don't exist
    }
  };

  // Add text files
  await Promise.all([
    addFileToZip('mantle-identity.json'),
    addFileToZip('mantle.css'),
    addFileToZip('README.md'),
  ]);

  // Add sigil images
  const sigilFiles = [
    'primary-sigil.png',
    'primary-sigil-transparent.png',
    'primary-sigil.svg',
    'secondary-crest.png',
    'secondary-crest-transparent.png',
    'secondary-crest.svg',
    'variation-simplified.png',
    'variation-simplified-transparent.png',
    'variation-simplified.svg',
    'variation-monochrome.png',
    'variation-monochrome-transparent.png',
    'variation-monochrome.svg',
    'variation-outline.png',
    'variation-outline-transparent.png',
    'variation-outline.svg',
  ];

  const sigils = zip.folder('sigils');
  await Promise.all(
    sigilFiles.map(async (file) => {
      try {
        const response = await fetch(`${basePath}/sigils/${file}`);
        if (response.ok) {
          const blob = await response.blob();
          sigils?.file(file, blob);
        }
      } catch {
        // Skip missing files
      }
    })
  );

  // Generate and download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = window.URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folder}_Mantle_Package.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
