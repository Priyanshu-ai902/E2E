import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  console.log("Using API Key:", apiKey.substring(0, 10) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);

  const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];

  for (const modelName of models) {
    console.log(`\n--- Auditing model: ${modelName} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello, respond in one word.");
      
      console.log(`[${modelName}] result type:`, typeof result);
      console.log(`[${modelName}] result keys:`, Object.keys(result));
      
      if (result.response) {
        console.log(`[${modelName}] result.response type:`, typeof result.response);
        console.log(`[${modelName}] result.response keys:`, Object.keys(result.response));
        
        console.log(`[${modelName}] Is result.response.text a function?`, typeof result.response.text === 'function');
        if (typeof result.response.text === 'function') {
          console.log(`[${modelName}] result.response.text():`, result.response.text());
        }
      }
      
      console.log(`[${modelName}] Is result.text a function?`, typeof (result as any).text === 'function');
      if (typeof (result as any).text === 'function') {
        console.log(`[${modelName}] result.text():`, (result as any).text());
      }
      
      console.log(`[${modelName}] Raw result:`, JSON.stringify(result, null, 2));

    } catch (e: any) {
      console.error(`Error auditing ${modelName}:`, e);
    }
  }
}

main().catch(console.error);
