import { beforeEach, describe, expect, it, vi } from 'vitest';

const gemini = vi.hoisted(() => {
  const generateContent = vi.fn();
  const GoogleGenAI = vi.fn(function MockGoogleGenAI() {
    return { models: { generateContent } };
  });
  return { generateContent, GoogleGenAI };
});

vi.mock('@google/genai', () => ({
  GoogleGenAI: gemini.GoogleGenAI,
  Type: {
    OBJECT: 'OBJECT',
    ARRAY: 'ARRAY',
    STRING: 'STRING',
  },
}));

import { BrandStudioError } from './BrandStudio';
import { createGeminiBrandStudio } from './geminiBrandStudio';
import { DEFAULT_GEMINI_MODEL_PROFILE } from './geminiModelProfile';

const identity = {
  tagline: 'Built to endure',
  brandVoice: 'Confident and clear',
  colors: [{
    hex: '#112233',
    name: 'Iron',
    usage: 'Primary',
    detailedUsage: 'Use for primary actions.',
    contrastInfo: 'AA on white',
  }],
  theme: {
    light: {
      background: '#ffffff',
      surface: '#f5f5f5',
      textPrimary: '#111111',
      textSecondary: '#444444',
      accent: '#112233',
      border: '#dddddd',
    },
    dark: {
      background: '#111111',
      surface: '#222222',
      textPrimary: '#ffffff',
      textSecondary: '#cccccc',
      accent: '#88aacc',
      border: '#444444',
    },
  },
  typography: {
    headerFamily: 'Merriweather',
    bodyFamily: 'Inter',
    reasoning: 'Authority with clarity.',
  },
};

const imageResponse = (data: string) => ({
  candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data } }] } }],
});

describe('Gemini BrandStudio adapter', () => {
  beforeEach(() => {
    gemini.generateContent.mockReset();
    gemini.GoogleGenAI.mockClear();
  });

  it('pins the deploy profile to stable Gemini models', () => {
    expect(DEFAULT_GEMINI_MODEL_PROFILE).toEqual({
      strategy: 'gemini-3.7-flash',
      image: 'gemini-3-pro-image',
    });
  });

  it('generates a validated Mantle draft through the BrandStudio interface', async () => {
    gemini.generateContent.mockImplementation((request: { config?: { responseMimeType?: string }; contents?: unknown }) => {
      if (request.config?.responseMimeType === 'application/json') {
        return Promise.resolve({ text: JSON.stringify(identity) });
      }
      const serialized = JSON.stringify(request.contents);
      return Promise.resolve(imageResponse(serialized.includes('Design a primary logo') ? 'primary' : 'secondary'));
    });

    const studio = createGeminiBrandStudio('test-key', {
      strategy: 'strategy-model',
      image: 'image-model',
    });
    const draft = await studio.generateBrand({ mission: '  Durable logistics  ', imageSize: '2K' });

    expect(draft.identity).toEqual({ ...identity, mission: 'Durable logistics' });
    expect(draft.logos).toEqual({
      primary: 'data:image/png;base64,primary',
      secondary: 'data:image/png;base64,secondary',
      variations: [],
    });
    expect(gemini.generateContent.mock.calls.map(([request]) => request.model)).toEqual([
      'strategy-model',
      'image-model',
      'image-model',
    ]);
    expect(gemini.generateContent.mock.calls.slice(1).map(([request]) => request.config.responseModalities)).toEqual([
      ['IMAGE'],
      ['IMAGE'],
    ]);
  });

  it('rejects structurally invalid identity output at the seam', async () => {
    gemini.generateContent.mockImplementation((request: { config?: { responseMimeType?: string } }) =>
      request.config?.responseMimeType === 'application/json'
        ? Promise.resolve({ text: JSON.stringify({ tagline: 'Incomplete' }) })
        : Promise.resolve(imageResponse('image')),
    );

    const studio = createGeminiBrandStudio('test-key');
    await expect(studio.generateBrand({ mission: 'A mission', imageSize: '1K' })).rejects.toMatchObject({
      name: 'BrandStudioError',
      code: 'invalid-response',
    });
  });

  it('normalizes provider authentication failures', async () => {
    gemini.generateContent.mockRejectedValue(Object.assign(new Error('API key invalid'), { status: 401 }));

    const studio = createGeminiBrandStudio('test-key');
    await expect(studio.regenerateLogo({ mission: 'A mission', kind: 'primary' })).rejects.toEqual(
      expect.objectContaining<Partial<BrandStudioError>>({
        name: 'BrandStudioError',
        code: 'authentication',
      }),
    );
  });

  it('rejects malformed source images before calling Gemini', async () => {
    const studio = createGeminiBrandStudio('test-key');

    await expect(studio.refineLogo({ image: 'not-an-image', instruction: 'Simplify it' })).rejects.toMatchObject({
      code: 'invalid-request',
    });
    expect(gemini.generateContent).not.toHaveBeenCalled();
  });
});

