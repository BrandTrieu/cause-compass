// lib/gemini.ts
import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // picked up automatically if set
});

export const MODEL_FAST = "gemini-2.5-flash"; // faster, cheaper
export const MODEL_SMART = "gemini-2.5-pro";  // deeper reasoning (slower)
