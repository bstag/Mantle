import ImageTracer from 'imagetracerjs';

/**
 * Converts a base64 PNG image to SVG vector format
 * @param base64Image - Base64 encoded image string (with or without data URI prefix)
 * @param options - Optional ImageTracer configuration
 * @returns Promise resolving to SVG string
 */
export const convertToSVG = async (
  base64Image: string,
  options?: Partial<typeof ImageTracer.optionpresets.default>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure we have a proper data URI
      const imageData = base64Image.startsWith('data:') 
        ? base64Image 
        : `data:image/png;base64,${base64Image}`;

      // Create an image element to load the data
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Use ImageTracer to convert to SVG
          // Using 'posterized2' preset for cleaner logo vectorization
          ImageTracer.imageToSVG(
            imageData,
            (svgstr: string) => {
              resolve(svgstr);
            },
            {
              ...ImageTracer.optionpresets.posterized2,
              ...options,
            }
          );
        } catch (error) {
          reject(new Error(`Vectorization failed: ${error}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for vectorization'));
      };

      img.src = imageData;
    } catch (error) {
      reject(new Error(`Image processing error: ${error}`));
    }
  });
};

/**
 * Downloads an SVG string as a file
 * @param svgString - The SVG content as a string
 * @param filename - Desired filename (without extension)
 */
export const downloadSVG = (svgString: string, filename: string) => {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Converts image to SVG and downloads it
 * @param base64Image - Base64 encoded image
 * @param filename - Desired filename (without extension)
 */
export const vectorizeAndDownload = async (
  base64Image: string,
  filename: string
): Promise<void> => {
  try {
    const svgString = await convertToSVG(base64Image);
    downloadSVG(svgString, filename);
  } catch (error) {
    console.error('Vectorization error:', error);
    throw error;
  }
};
