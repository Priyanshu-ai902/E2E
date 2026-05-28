import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};
