
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Directly use process.env.API_KEY for initializing GoogleGenAI as per strict SDK guidelines.
export const getCalmSupportMessage = async () => {
  // Always initialize inside the function to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give me a short, calm, and supportive message for a student struggling with discipline. Maximum 2 sentences. No hype, just grounded support.",
      config: {
        systemInstruction: "You are BRAYNER, a serious but caring academic companion for Bangladeshi SSC/HSC students. Your tone is supportive, calm, and structured. Avoid exclamation marks and dramatic language.",
      }
    });
    return response.text?.trim() || "Focus on consistency. Small steps lead to great progress.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The path to discipline is a journey of small wins. Keep going.";
  }
};

export const analyzeWeakness = async (subject: string, performanceSummary: string) => {
  // Always initialize inside the function to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this student performance in ${subject}: ${performanceSummary}. Suggest one specific focus area.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weaknessType: { type: Type.STRING, description: "One of: Concept confusion, Formula misuse, Speed issue" },
            suggestion: { type: Type.STRING },
            priority: { type: Type.STRING, description: "High, Medium, Low" }
          },
          required: ["weaknessType", "suggestion", "priority"]
        }
      }
    });
    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
