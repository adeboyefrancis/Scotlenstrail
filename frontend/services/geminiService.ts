
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTrailHistory = async (trailTitle: string, userLocation: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a concise, engaging historical fact or ghost story about ${trailTitle} near ${userLocation} in Scotland. Keep it under 100 words. Tone: Mysterious and educational.`,
    });

    return response.text || "History is silent today...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not retrieve history from the archives at this moment.";
  }
};

/**
 * Uses Gemini's Google Maps tool to search for real-time location data.
 * This provides the "Real-time" aspect requested for the map view.
 * Maps grounding is only supported in Gemini 2.5 series models.
 */
export const searchNearbyPlaces = async (query: string, lat: number, lng: number) => {
  try {
    const response = await ai.models.generateContent({
      // Fix: Use 'gemini-2.5-flash' for maps grounding as it is a supported 2.5 series model.
      model: "gemini-2.5-flash",
      contents: `Search for ${query} near Edinburgh/Highlands area. Provide a brief summary of the best options.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    return {
      text: response.text,
      links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return null;
  }
};
