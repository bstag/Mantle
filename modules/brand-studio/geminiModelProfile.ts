export interface GeminiModelProfile {
  strategy: string;
  image: string;
}

/**
 * The single migration point for Gemini model identifiers. Callers select a
 * Mantle capability; only the Gemini adapter knows which model provides it.
 */
export const DEFAULT_GEMINI_MODEL_PROFILE: Readonly<GeminiModelProfile> = Object.freeze({
  strategy: 'gemini-3.7-flash',
  image: 'gemini-3-pro-image',
});

