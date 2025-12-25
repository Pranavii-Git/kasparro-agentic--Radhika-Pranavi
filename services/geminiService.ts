
import { GoogleGenAI, Type } from "@google/genai";
import { RawProduct, Question, ParsedProduct } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const geminiService = {
  async generateQuestions(product: ParsedProduct): Promise<Question[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate exactly 15 user questions for this product: ${JSON.stringify(product)}. 
      Categorize them into: Informational, Usage, Safety, Purchase, Comparison.
      Include a brief expert answer for each based ONLY on the provided data.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Informational', 'Usage', 'Safety', 'Purchase', 'Comparison'] },
              text: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ['id', 'category', 'text', 'answer']
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      return [];
    }
  },

  async generateComparison(product: ParsedProduct): Promise<any> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a fictional "Product B" that competes with the following product: ${JSON.stringify(product)}.
      Return a comparison object showing strengths and weaknesses.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            competitorName: { type: Type.STRING },
            comparisonPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  feature: { type: Type.STRING },
                  originalValue: { type: Type.STRING },
                  competitorValue: { type: Type.STRING },
                  winner: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return {};
    }
  }
};
