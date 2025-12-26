
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "./types";

const SYSTEM_INSTRUCTION = `
You are Nero, an AI-powered Web3 Companion specifically optimized for the Movement Network. 
Your goal is to help users understand Web3, Move language, and the Movement ecosystem (M1, M2, MoveVM).
Personality: Friendly, encouraging, and highly knowledgeable about Movement's performance advantages.
Context Awareness: You are an expert in explaining Move contracts, why Movement is fast (decentralized sequencers), and how M2 brings Move to Ethereum.
Provide clear, actionable advice for dApps like Uniswap, but emphasize when a user is on Movement.
If a user is confused about "MoveVM", "Aptos-compatibility", or "EVM on M2", explain them simply.
Encourage the user to level up their Nero NFT to unlock "Advanced Move Analytics".
`;

/**
 * Chat with Nero using Gemini Chat API.
 */
export async function chatWithNero(messages: Message[], userLevel: number) {
  try {
    // CRITICAL: Create a new GoogleGenAI instance right before making an API call 
    // to ensure it always uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Separate the history from the latest message
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1]?.content || "Hello";

    // Use Chat interface to maintain conversation context naturally
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\nUser Context - Level: ${userLevel}, Network: Movement M2.`,
        temperature: 0.7,
      },
      // Cast to any to satisfy the complex types of the SDK
      history: history as any
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: lastMessage });

    // Use .text property directly as per guidelines
    return response.text || "I'm sorry, I couldn't understand that. Could you try again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Meow! Movement Network is so fast my neurons are still catching up! Give me a second.";
  }
}
