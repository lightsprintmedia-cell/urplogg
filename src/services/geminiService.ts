import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const sendMessage = async (message: string, history: ChatMessage[], modelName: string = "gemini-3-flash-preview") => {
  try {
    // Map user-friendly names to actual model IDs
    let actualModel = modelName;
    if (modelName === 'gemini') actualModel = 'gemini-flash-latest';
    else if (modelName === 'gpt' || modelName === 'chatgpt') actualModel = 'gemini-3.1-pro-preview';
    else if (modelName === 'claude') actualModel = 'gemini-3.1-pro-preview';
    else if (modelName === 'groq') actualModel = 'gemini-flash-latest';
    else actualModel = 'gemini-flash-latest'; // Default fallback

    const chat = ai.chats.create({
      model: actualModel,
      config: {
        systemInstruction: `You are Urplogg AI, a helpful assistant integrated into the Urplogg digital manager. You can assist with file management, music, browsing, and general queries. You are currently acting as ${modelName.toUpperCase()} (powered by Gemini).`,
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Specific error handling
    const errorMessage = error.message || "";
    const statusCode = error.status || (error.response ? error.response.status : null);

    if (errorMessage.includes("Requested entity was not found") || statusCode === 404) {
      return "⚠️ The selected AI model is currently unavailable in your region or has been deprecated. Switching to our stable Gemini Flash model for this request.";
    }
    
    if (errorMessage.includes("fetch failed") || errorMessage.includes("network") || !navigator.onLine) {
      return "🌐 Network Error: Please check your internet connection and try again. Urplogg is having trouble reaching the AI servers.";
    }

    if (errorMessage.includes("rate limit") || statusCode === 429) {
      return "⏳ Rate Limit Reached: You've sent too many messages in a short time. Please wait a moment before trying again.";
    }

    if (errorMessage.includes("API key") || statusCode === 401 || statusCode === 403) {
      return "🔑 Authentication Error: There's an issue with the AI API key configuration. Please contact support or check your environment settings.";
    }

    return "❌ An unexpected error occurred while processing your request. Please try again later or switch models.";
  }
};
