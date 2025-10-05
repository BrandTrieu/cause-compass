import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY in environment.");

export const gemini = new GoogleGenerativeAI(apiKey);
export const MODEL_ID = "gemini-2.5-flash"; // fast + capable
