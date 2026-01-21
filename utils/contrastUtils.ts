export const getLuminance = (hex: string) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
  const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

  const [lr, lg, lb] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

export const getContrastRatio = (hex1: string, hex2: string) => {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

export const analyzeContrast = (bgHex: string) => {
  if (!/^#[0-9A-F]{6}$/i.test(bgHex)) return { isAccessible: true, ratio: 21, bestText: '#FFFFFF' };

  const whiteContrast = getContrastRatio(bgHex, '#FFFFFF');
  const blackContrast = getContrastRatio(bgHex, '#000000');
  
  const bestText = whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
  const maxRatio = Math.max(whiteContrast, blackContrast);
  
  return {
    isAccessible: maxRatio >= 4.5,
    ratio: maxRatio.toFixed(2),
    bestText
  };
};
