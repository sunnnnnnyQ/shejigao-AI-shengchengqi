
import { GoogleGenAI, Type } from "@google/genai";
import { DeviceType, ModelType, OptimizedPrompt } from "../types";

// Helper for dynamic key usage - Vite requires import.meta.env
const getAI = () => new GoogleGenAI({ apiKey: (import.meta.env.VITE_API_KEY as string) });

const ASPECT_RATIOS = {
  [DeviceType.IPHONE]: "9:16",
  [DeviceType.ANDROID]: "9:16",
  [DeviceType.PC]: "16:9"
};

export const geminiService = {
  checkProKey: async (): Promise<boolean> => {
    // @ts-ignore
    if (typeof window.aistudio === 'undefined') return true; // Local dev fallback
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      return true; // Assume success after opening dialog as per guidelines
    }
    return true;
  },

  optimizePrompts: async (userInput: string): Promise<OptimizedPrompt[]> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User wants to design a UI for: "${userInput}". 
      Generate 4 distinct UI layout variants (A, B, C, D) focusing on structural differences.
      A: Standard/Centered - clean, focused on one primary action.
      B: Multi-column/Split - high information density, side navigation.
      C: Immersive/Visual - edge-to-edge media, minimal text, gesture-focused.
      D: Card-based/Modular - structured components, easy-to-read segments.
      Return strictly JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              label: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["type", "label", "content"]
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((r: any) => ({
      ...r,
      id: Math.random().toString(36).substring(7)
    }));
  },

  generateUIDesign: async (prompt: string, device: DeviceType, model: ModelType): Promise<string> => {
    const ai = getAI();
    const deviceTag = device === DeviceType.PC ? "desktop web interface" : "mobile app UI";
    const fullPrompt = `UI DESIGN: ${prompt}. Device: ${deviceTag}. Professional, modern, high-fidelity, clean aesthetics, Figma style, 4k, trending on Dribbble.`;

    const config: any = {
      imageConfig: {
        aspectRatio: ASPECT_RATIOS[device]
      }
    };

    if (model === ModelType.GEMINI_PRO) {
      config.imageConfig.imageSize = "1K";
    }

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [{ text: fullPrompt }] },
        config
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) {
        // Handle race condition/stale key by re-triggering key selection if needed
        console.error("API Key error, prompt user to re-select.");
      }
      throw error;
    }

    throw new Error("No image data returned from AI");
  }
};
