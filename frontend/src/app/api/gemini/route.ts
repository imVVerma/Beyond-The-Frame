import { NextResponse } from "next/server";

// Allow this route to run for up to 60 seconds on Vercel to prevent AI timeouts
export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ success: false, error: "Image data and mimeType are required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY is missing in Vercel Environment Variables." }, { status: 500 });
    }

    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
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

    const geminiBody = {
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
      body: JSON.stringify(geminiBody)
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ success: false, error: errorData.error?.message || `HTTP ${res.status}: Failed to reach Gemini.` }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return NextResponse.json({ success: false, error: "Gemini returned an empty narrative. Please try a different photo." }, { status: 500 });
    }

    return NextResponse.json({ success: true, text });

  } catch (error: any) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Unknown server error" }, { status: 500 });
  }
}
