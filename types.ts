
export interface Color {
  hex: string;
  name: string;
  usage: string;
  detailedUsage: string;
  contrastInfo: string;
}

export interface FontPairing {
  headerFamily: string;
  bodyFamily: string;
  reasoning: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  border: string;
}

export interface BrandIdentity {
  mission: string;
  colors: Color[];
  theme: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  typography: FontPairing;
  brandVoice: string;
  tagline: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface LogoVariation {
  name: string;
  label: string;
  image: string; // base64
}

export interface LogoResult {
  primary: string | null; // base64
  secondary: string | null; // base64
  variations: LogoVariation[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
