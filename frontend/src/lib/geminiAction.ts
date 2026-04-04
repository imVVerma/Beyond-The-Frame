"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Server Action to generate a story using Gemini Pro Vision.
 * This keeps the API key safely on the server.
 */
export async function generateStoryWithAI({ imageBase64, mimeType }: { imageBase64: string, mimeType: string }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is missing in Vercel Environment Variables." };
  }

  try {
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    console.log(`[AI Story] Calling Gemini API: ${model} on v1 endpoint...`);

    const prompt = `
      You are the photographer who just took this photo. Write a short 'Behind the Lens' journal entry about the experience of capturing it.
      
      CRITICAL INSTRUCTIONS:
      - Write in the first-person ("I wait", "I noticed").
      - Tone: Grounded, authentic, and observational. Speak like a real person, not a poet.
      - DO NOT use flowery AI cliches (e.g., avoid words like "symphony", "tapestry", "ethereal dance", "whispers", "canvas").
      - Focus on the physical reality: the wait, the quality of light, the temperature, or a passing thought you had.
      - Keep it brief (2 short paragraphs maximum).
      - Do not mention camera settings.
      - Output ONLY the story text, do not include titles.
    `;

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.error?.message || `HTTP ${res.status}: Failed to reach Gemini.` };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return { success: false, error: "Gemini returned an empty narrative. Please try a different photo." };
    }

    return { success: true, text };
  } catch (error: any) {
    console.error("Gemini Direct API Error:", error);
    return { success: false, error: error.message || "Unknown Gemini API error" };
  }
}

