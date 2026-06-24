import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});