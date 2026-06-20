import { GoogleGenerativeAI, EnhancedGenerateContentResponse, GenerateContentResult } from "@google/generative-ai";
import { db } from "../db";
import { aiCallLogs } from "../db/schema";

const PROVIDER_PRIORITY = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash"
];

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];
const TIMEOUT_MS = 30000;

interface FailoverOptions {
  analysisRunId?: number;
  requestType: string;
}

export async function generateContentWithFailover(
  contents: any[],
  options: FailoverOptions
): Promise<EnhancedGenerateContentResponse> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  let lastError: any = null;
  
  for (let i = 0; i < PROVIDER_PRIORITY.length; i++) {
    const modelName = PROVIDER_PRIORITY[i];
    const startTime = Date.now();
    let attempts = 0;
    const maxRetriesPerProvider = 2;

    while (attempts <= maxRetriesPerProvider) {
      attempts++;
      try {
        console.log(`[AI Failover] Attempting request with ${modelName} (Attempt ${attempts}/${maxRetriesPerProvider + 1})`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Wrap in a promise to handle timeout
        const requestPromise = model.generateContent(contents);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), TIMEOUT_MS)
        );

        const result = await Promise.race([requestPromise, timeoutPromise]) as GenerateContentResult;
        
        const latencyMs = Date.now() - startTime;
        
        // Log success to DB
        await logAICall({
          analysisRunId: options.analysisRunId,
          providerUsed: "Google",
          modelName,
          attempts,
          latencyMs,
          status: "SUCCESS",
          requestType: options.requestType
        });

        console.log(`[AI Failover] Success with ${modelName} in ${latencyMs}ms`);
        return result.response;

      } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        const status = getErrorStatus(error);
        const isRetryable = isRetryableError(error, status);

        console.warn(`[AI Failover] Error with ${modelName}: ${error.message} (Status: ${status}, Retryable: ${isRetryable})`);

        if (!isRetryable || attempts > maxRetriesPerProvider) {
          // Log failure for this provider and move to next or throw
          await logAICall({
            analysisRunId: options.analysisRunId,
            providerUsed: "Google",
            modelName,
            attempts,
            latencyMs,
            status: "FAILURE",
            errorMessage: error.message,
            requestType: options.requestType
          });
          
          lastError = error;
          break; // Move to next provider
        }
        
        // Wait before retrying same provider (exponential backoff)
        const backoffMs = Math.pow(2, attempts) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError || new Error("All AI providers failed");
}

function getErrorStatus(error: any): number {
  if (error.message?.includes("Timeout")) return 408;
  if (error.status) return error.status;
  if (error.response?.status) return error.response.status;
  // Some SDK errors have a 'code' property
  if (typeof error.code === 'number') return error.code;
  return 500; // Default to 500 for unknown errors
}

function isRetryableError(error: any, status: number): boolean {
  // Retry on timeout
  if (status === 408 || error.message?.includes("Timeout")) return true;
  
  // Retry on specific status codes
  if (RETRYABLE_STATUS_CODES.includes(status)) return true;
  
  return false;
}

async function logAICall(data: {
  analysisRunId?: number;
  providerUsed: string;
  modelName: string;
  attempts: number;
  latencyMs: number;
  status: string;
  errorMessage?: string;
  requestType: string;
}) {
  try {
    await db.insert(aiCallLogs).values({
      analysisRunId: data.analysisRunId,
      providerUsed: data.providerUsed,
      modelName: data.modelName,
      attempts: data.attempts,
      latencyMs: data.latencyMs,
      status: data.status,
      errorMessage: data.errorMessage,
      requestType: data.requestType
    });
  } catch (dbError) {
    console.error("[AI Failover] Failed to log AI call to database:", dbError);
  }
}

export function extractTextFromGeminiResponse(response: any): string {
  if (!response) {
    console.error("[FAILOVER] extractTextFromGeminiResponse received null or undefined response");
    throw new Error("Empty response received from AI model");
  }

  // Task 1: Log keys and shape of response
  console.log(`[FAILOVER] Response keys: ${Object.keys(response)}`);

  // 1. If it has a .text function directly (typical for EnhancedGenerateContentResponse)
  if (typeof response.text === 'function') {
    try {
      const text = response.text();
      if (typeof text === 'string') return text;
    } catch (e: any) {
      console.warn("[FAILOVER] Call to response.text() failed, trying other paths:", e.message);
    }
  }

  // 2. If it is a wrapper object (like GenerateContentResult) containing .response.text()
  if (response.response && typeof response.response.text === 'function') {
    try {
      const text = response.response.text();
      if (typeof text === 'string') return text;
    } catch (e: any) {
      console.warn("[FAILOVER] Call to response.response.text() failed:", e.message);
    }
  }

  // 3. Fallback to candidate inspection
  if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }
  
  if (response.response?.candidates && response.response.candidates[0]?.content?.parts?.[0]?.text) {
    return response.response.candidates[0].content.parts[0].text;
  }

  // Defensive dump of shape
  console.error("[FAILOVER] Failed to extract text. Raw response structure:", JSON.stringify(response, null, 2));
  throw new Error("Unable to extract text content from AI response structure");
}
