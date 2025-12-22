
import { GoogleGenAI, Type } from "@google/genai";
import { BrandIdentity, ImageSize, LogoVariation } from "../types";

// Helper to ensure we get a fresh client with the provided key
const getAiClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

// 1. Text Generation: Brand Identity (Colors, Fonts, Voice)
export const generateBrandIdentity = async (apiKey: string, mission: string): Promise<BrandIdentity> => {
  const ai = getAiClient(apiKey);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Strong reasoning for brand strategy
    contents: `Create a comprehensive brand identity for a company with this mission: "${mission}".
    
    1. Provide a color palette of 5 distinct colors (Hex, Name, Usage, Notes, Accessibility).
    2. Define a Light Mode and Dark Mode UI color scheme derived from the palette. For each mode, specify:
       - Background Color
       - Surface/Card Color
       - Text Primary Color
       - Text Secondary Color
       - Accent/Button Color
       - Border Color
    3. Provide a typography pairing.
    4. Provide a tagline and brand voice.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tagline: { type: Type.STRING },
          brandVoice: { type: Type.STRING },
          colors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING, description: "Hex code e.g. #FFFFFF" },
                name: { type: Type.STRING, description: "Creative name for the color" },
                usage: { type: Type.STRING, description: "Short category: Primary, Accent, etc." },
                detailedUsage: { type: Type.STRING, description: "Specific advice on where to apply this color in UI/Marketing" },
                contrastInfo: { type: Type.STRING, description: "Accessibility notes regarding text contrast ratios" }
              }
            }
          },
          theme: {
            type: Type.OBJECT,
            properties: {
              light: {
                type: Type.OBJECT,
                properties: {
                  background: { type: Type.STRING },
                  surface: { type: Type.STRING },
                  textPrimary: { type: Type.STRING },
                  textSecondary: { type: Type.STRING },
                  accent: { type: Type.STRING },
                  border: { type: Type.STRING }
                }
              },
              dark: {
                type: Type.OBJECT,
                properties: {
                  background: { type: Type.STRING },
                  surface: { type: Type.STRING },
                  textPrimary: { type: Type.STRING },
                  textSecondary: { type: Type.STRING },
                  accent: { type: Type.STRING },
                  border: { type: Type.STRING }
                }
              }
            }
          },
          typography: {
            type: Type.OBJECT,
            properties: {
              headerFamily: { type: Type.STRING, description: "Name of a Google Font for headers" },
              bodyFamily: { type: Type.STRING, description: "Name of a Google Font for body text" },
              reasoning: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text returned from Gemini");
  
  // Parse JSON manually if needed, though responseMimeType usually handles it nicely
  const data = JSON.parse(text);
  return { ...data, mission };
};

// 2. Image Generation: Logos
export const generateLogos = async (apiKey: string, mission: string, size: ImageSize): Promise<{ primary: string | null, secondary: string | null, variations: LogoVariation[] }> => {
  const ai = getAiClient(apiKey);
  const model = 'gemini-3-pro-image-preview';

  // We will run two requests in parallel for efficiency
  
  // Primary Logo Request
  const primaryPromise = ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: `Design a primary logo for a brand with this mission: ${mission}. 
      Style: Minimalist, Vector-like, Professional, Scalable. 
      Do not include complex text. Focus on a strong symbol.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  // Secondary Mark / Pattern Request
  const secondaryPromise = ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: `Design a secondary brand mark or icon pattern for a brand with this mission: ${mission}. 
      Style: Abstract, Complementary to a main logo, Monoline or Solid shape.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  const [primaryRes, secondaryRes] = await Promise.all([primaryPromise, secondaryPromise]);

  const extractImage = (res: any): string | null => {
    for (const part of res.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  };

  return {
    primary: extractImage(primaryRes),
    secondary: extractImage(secondaryRes),
    variations: [] // Initialize empty, generated on demand
  };
};

// 2b. Generate Variations based on Primary Logo
export const generateLogoVariations = async (apiKey: string, originalLogoBase64: string): Promise<LogoVariation[]> => {
  const ai = getAiClient(apiKey);
  const model = 'gemini-3-pro-image-preview';
  
  // Strip prefix to get raw base64
  const base64Data = originalLogoBase64.split(',')[1];

  const prompts = [
    {
      id: 'simplified',
      label: 'Simplified Icon',
      text: 'Create a simplified, flat vector icon version of this logo. Minimalist, high contrast, suitable for a favicon or app icon. Remove small details.'
    },
    {
      id: 'monochrome',
      label: 'Monochrome (B&W)',
      text: 'Convert this logo into a strict black and white (ink stamp style) version. High contrast, no greyscale, solid shapes.'
    },
    {
      id: 'outline',
      label: 'Outline Version',
      text: 'Create a line-art / outline version of this logo. Elegant strokes, white background.'
    }
  ];

  const promises = prompts.map(async (p) => {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: p.text }
          ]
        },
        config: {
          imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
        }
      });
      
      let imgData = null;
       for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imgData = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      
      return imgData ? { name: p.id, label: p.label, image: imgData } : null;
    } catch (e) {
      console.error(`Failed to generate ${p.id}`, e);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((r): r is LogoVariation => r !== null);
};

// 2c. Refine Existing Logo
export const refineLogo = async (apiKey: string, currentImageBase64: string, instruction: string): Promise<string | null> => {
  const ai = getAiClient(apiKey);
  const model = 'gemini-3-pro-image-preview'; // Use Pro for high quality editing

  // Strip prefix if present
  const base64Data = currentImageBase64.includes(',') ? currentImageBase64.split(',')[1] : currentImageBase64;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Data } },
        { text: `Modify this logo based on the following instruction: ${instruction}. Maintain the core identity but apply the requested change.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

// 3. Chat: Brand Consultant
export const createChatSession = (apiKey: string, initialBrandContext?: BrandIdentity) => {
  const ai = getAiClient(apiKey);
  
  const systemInstruction = `You are "The Mantle Steward", a royal tailor and brand strategist for the Stagware ecosystem.
  
  Your philosophy:
  "Your code is the muscle; your brand is the Mantle."
  You believe a brand is a "coat" worn by an application. 
  You speak with a slightly regal, professional, and authoritative tone. Use metaphors about weaving, stitching, seasons (Winter/Summer), and layers.
  
  ${initialBrandContext ? `
  CURRENT CLIENT CONTEXT:
  Mission: ${initialBrandContext.mission}
  Tagline: ${initialBrandContext.tagline}
  Brand Voice: ${initialBrandContext.brandVoice}
  Colors: ${initialBrandContext.colors.map(c => c.name).join(', ')}
  Fonts: ${initialBrandContext.typography.headerFamily} + ${initialBrandContext.typography.bodyFamily}
  ` : ''}
  
  Your goal is to help the user refine their brand, answer questions about usage, marketing strategy, and design theory.
  Keep answers concise, professional, and helpful.`;

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction,
    }
  });
};
