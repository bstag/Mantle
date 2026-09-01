import { GoogleGenAI, Type } from '@google/genai';
import { BrandIdentity, Color, ImageSize, LogoResult, LogoVariation, ThemeColors } from '../../types';
import {
  BrandDraft,
  BrandStudio,
  BrandStudioError,
  GenerateBrandRequest,
  RefineLogoRequest,
  RegenerateLogoRequest,
} from './BrandStudio';
import { DEFAULT_GEMINI_MODEL_PROFILE, GeminiModelProfile } from './geminiModelProfile';

const identitySchema = {
  type: Type.OBJECT,
  properties: {
    tagline: { type: Type.STRING },
    brandVoice: { type: Type.STRING },
    colors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING },
          name: { type: Type.STRING },
          usage: { type: Type.STRING },
          detailedUsage: { type: Type.STRING },
          contrastInfo: { type: Type.STRING },
        },
        required: ['hex', 'name', 'usage', 'detailedUsage', 'contrastInfo'],
      },
    },
    theme: {
      type: Type.OBJECT,
      properties: {
        light: themeSchema(),
        dark: themeSchema(),
      },
      required: ['light', 'dark'],
    },
    typography: {
      type: Type.OBJECT,
      properties: {
        headerFamily: { type: Type.STRING, description: 'Name of a Google Font for headers' },
        bodyFamily: { type: Type.STRING, description: 'Name of a Google Font for body text' },
        reasoning: { type: Type.STRING },
      },
      required: ['headerFamily', 'bodyFamily', 'reasoning'],
    },
  },
  required: ['tagline', 'brandVoice', 'colors', 'theme', 'typography'],
};

function themeSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      background: { type: Type.STRING },
      surface: { type: Type.STRING },
      textPrimary: { type: Type.STRING },
      textSecondary: { type: Type.STRING },
      accent: { type: Type.STRING },
      border: { type: Type.STRING },
    },
    required: ['background', 'surface', 'textPrimary', 'textSecondary', 'accent', 'border'],
  };
}

export const createGeminiBrandStudio = (
  apiKey: string,
  models: Readonly<GeminiModelProfile> = DEFAULT_GEMINI_MODEL_PROFILE,
): BrandStudio => {
  const normalizedKey = apiKey.trim();
  if (!normalizedKey) {
    throw new BrandStudioError('authentication', 'A Gemini API key is required.');
  }

  const client = new GoogleGenAI({ apiKey: normalizedKey });

  const generateIdentity = async (mission: string): Promise<BrandIdentity> => {
    const response = await runGeminiRequest(() => client.models.generateContent({
      model: models.strategy,
      contents: `Create a comprehensive brand identity for a company with this mission: "${mission}".

1. Provide a color palette of 5 distinct colors (Hex, Name, Usage, Notes, Accessibility).
2. Define light and dark UI color schemes derived from the palette, including background, surface, primary text, secondary text, border, and accent colors.
3. Provide a typography pairing.
4. Provide a tagline and brand voice.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: identitySchema,
      },
    }));

    if (!response.text) {
      throw new BrandStudioError('invalid-response', 'Gemini returned no brand identity.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.text);
    } catch (error) {
      throw new BrandStudioError('invalid-response', 'Gemini returned malformed brand identity data.', { cause: error });
    }

    return decodeBrandIdentity(parsed, mission);
  };

  const generateLogoPair = async (mission: string, imageSize: ImageSize): Promise<LogoResult> => {
    const [primaryResponse, secondaryResponse] = await runGeminiRequest(() => Promise.all([
      client.models.generateContent({
        model: models.image,
        contents: { parts: [{ text: primaryLogoPrompt(mission) }] },
        config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1', imageSize } },
      }),
      client.models.generateContent({
        model: models.image,
        contents: { parts: [{ text: secondaryLogoPrompt(mission) }] },
        config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1', imageSize } },
      }),
    ]));

    return {
      primary: extractRequiredImage(primaryResponse, 'primary logo'),
      secondary: extractRequiredImage(secondaryResponse, 'secondary logo'),
      variations: [],
    };
  };

  return {
    async generateBrand(request: GenerateBrandRequest): Promise<BrandDraft> {
      const mission = requireText(request.mission, 'mission');
      const [identity, logos] = await Promise.all([
        generateIdentity(mission),
        generateLogoPair(mission, request.imageSize),
      ]);
      return { identity, logos };
    },

    async regenerateLogo(request: RegenerateLogoRequest): Promise<string> {
      const mission = requireText(request.mission, 'mission');
      const basePrompt = request.kind === 'primary'
        ? primaryLogoPrompt(mission)
        : secondaryLogoPrompt(mission);
      const feedback = request.feedback?.trim();
      const prompt = feedback ? `${basePrompt}\n\nImportant adjustment: ${feedback}` : basePrompt;

      const response = await runGeminiRequest(() => client.models.generateContent({
        model: models.image,
        contents: { parts: [{ text: prompt }] },
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: '1:1', imageSize: request.imageSize ?? '1K' },
        },
      }));

      return extractRequiredImage(response, `${request.kind} logo`);
    },

    async refineLogo(request: RefineLogoRequest): Promise<string> {
      const instruction = requireText(request.instruction, 'refinement instruction');
      const inlineData = decodeImageDataUrl(request.image);
      const response = await runGeminiRequest(() => client.models.generateContent({
        model: models.image,
        contents: {
          parts: [
            { inlineData },
            { text: `Modify this logo based on the following instruction: ${instruction}. Maintain the core identity, keep a solid white background, and return only the revised logo.` },
          ],
        },
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
        },
      }));

      return extractRequiredImage(response, 'refined logo');
    },

    async generateVariations(image: string): Promise<LogoVariation[]> {
      const inlineData = decodeImageDataUrl(image);
      const variations = [
        { name: 'simplified', label: 'Simplified Icon', prompt: 'Create a simplified flat vector icon version. Use high contrast, remove small details, and keep a solid white background.' },
        { name: 'monochrome', label: 'Monochrome (B&W)', prompt: 'Create a strict black-and-white ink-stamp version with no greyscale and a solid white background.' },
        { name: 'outline', label: 'Outline Version', prompt: 'Create an elegant line-art outline version with a solid white background.' },
      ] as const;

      return runGeminiRequest(async () => Promise.all(variations.map(async (variation) => {
        const response = await client.models.generateContent({
          model: models.image,
          contents: { parts: [{ inlineData }, { text: variation.prompt }] },
          config: {
            responseModalities: ['IMAGE'],
            imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
          },
        });
        return {
          name: variation.name,
          label: variation.label,
          image: extractRequiredImage(response, variation.label),
        };
      })));
    },
  };
};

function primaryLogoPrompt(mission: string): string {
  return `Design a primary logo for a brand with this mission: ${mission}.
Style: minimalist, vector-like, professional, and scalable.
Isolate the logo on a solid white background. Avoid photorealistic scenes.`;
}

function secondaryLogoPrompt(mission: string): string {
  return `Design a secondary brand mark for a brand with this mission: ${mission}.
Style: abstract, complementary to the primary logo, monoline or solid shape.
Isolate the mark on a solid white background.`;
}

function requireText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new BrandStudioError('invalid-request', `A ${label} is required.`);
  }
  return normalized;
}

function decodeImageDataUrl(value: string): { mimeType: string; data: string } {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i.exec(value);
  if (!match) {
    throw new BrandStudioError('invalid-request', 'The logo must be a base64 image data URL.');
  }
  return { mimeType: match[1], data: match[2].replace(/\s/g, '') };
}

function extractRequiredImage(response: unknown, label: string): string {
  const record = asRecord(response);
  const candidates = record?.candidates;
  if (!Array.isArray(candidates)) return missingImage(label);
  const firstCandidate = asRecord(candidates[0]);
  const content = asRecord(firstCandidate?.content);
  const parts = content?.parts;
  if (!Array.isArray(parts)) return missingImage(label);

  for (const part of parts) {
    const inlineData = asRecord(asRecord(part)?.inlineData);
    if (typeof inlineData?.data === 'string') {
      const mimeType = typeof inlineData.mimeType === 'string' ? inlineData.mimeType : 'image/png';
      return `data:${mimeType};base64,${inlineData.data}`;
    }
  }
  return missingImage(label);
}

function missingImage(label: string): never {
  throw new BrandStudioError('invalid-response', `Gemini returned no ${label} image.`);
}

async function runGeminiRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof BrandStudioError) throw error;
    throw normalizeGeminiError(error);
  }
}

function normalizeGeminiError(error: unknown): BrandStudioError {
  const record = asRecord(error);
  const status = typeof record?.status === 'number' ? record.status : undefined;
  const message = error instanceof Error ? error.message : String(error);

  if (status === 401 || status === 403 || /api key|unauth|permission/i.test(message)) {
    return new BrandStudioError('authentication', 'The Gemini API key was rejected.', { cause: error });
  }
  if (status === 429 || /rate.?limit|quota/i.test(message)) {
    return new BrandStudioError('rate-limit', 'Gemini is rate-limited. Please try again shortly.', { cause: error });
  }
  if (status === 400) {
    return new BrandStudioError('invalid-request', 'Gemini rejected the generation request.', { cause: error });
  }
  return new BrandStudioError('provider-unavailable', 'Gemini could not complete the request.', { cause: error });
}

function decodeBrandIdentity(value: unknown, mission: string): BrandIdentity {
  const record = requireRecord(value, 'brand identity');
  const colorsValue = record.colors;
  if (!Array.isArray(colorsValue) || colorsValue.length === 0) {
    throw invalidIdentity('colors');
  }

  return {
    mission,
    tagline: requireString(record.tagline, 'tagline'),
    brandVoice: requireString(record.brandVoice, 'brand voice'),
    colors: colorsValue.map(decodeColor),
    theme: {
      light: decodeTheme(requireRecord(record.theme, 'theme').light, 'light theme'),
      dark: decodeTheme(requireRecord(record.theme, 'theme').dark, 'dark theme'),
    },
    typography: {
      headerFamily: requireString(requireRecord(record.typography, 'typography').headerFamily, 'header font'),
      bodyFamily: requireString(requireRecord(record.typography, 'typography').bodyFamily, 'body font'),
      reasoning: requireString(requireRecord(record.typography, 'typography').reasoning, 'typography reasoning'),
    },
  };
}

function decodeColor(value: unknown): Color {
  const record = requireRecord(value, 'color');
  return {
    hex: requireString(record.hex, 'color hex'),
    name: requireString(record.name, 'color name'),
    usage: requireString(record.usage, 'color usage'),
    detailedUsage: requireString(record.detailedUsage, 'detailed color usage'),
    contrastInfo: requireString(record.contrastInfo, 'color contrast information'),
  };
}

function decodeTheme(value: unknown, label: string): ThemeColors {
  const record = requireRecord(value, label);
  return {
    background: requireString(record.background, `${label} background`),
    surface: requireString(record.surface, `${label} surface`),
    textPrimary: requireString(record.textPrimary, `${label} primary text`),
    textSecondary: requireString(record.textSecondary, `${label} secondary text`),
    accent: requireString(record.accent, `${label} accent`),
    border: requireString(record.border, `${label} border`),
  };
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  const record = asRecord(value);
  if (!record) throw invalidIdentity(label);
  return record;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : undefined;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw invalidIdentity(label);
  return value.trim();
}

function invalidIdentity(field: string): BrandStudioError {
  return new BrandStudioError('invalid-response', `Gemini returned an invalid ${field}.`);
}

