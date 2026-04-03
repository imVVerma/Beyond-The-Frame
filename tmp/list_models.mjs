import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../frontend/.env.local") });

async function list() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // There isn't a direct listModels in the high-level GenAI class in some versions,
    // but the error suggests checking it. 
    // Usually, we can just try 'gemini-1.5-flash' (standard).
    console.log("Checking gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Model initialized. Testing content generation (no image)...");
    const result = await model.generateContent("Hi");
    const response = await result.response;
    console.log("Success with gemini-1.5-flash:", response.text());
  } catch (e) {
    console.error("Failed with gemini-1.5-flash:", e.message);
    
    try {
      console.log("Trying gemini-pro...");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("Hi");
      console.log("Success with gemini-pro");
    } catch (e2) {
      console.error("Failed with gemini-pro:", e2.message);
    }
  }
}

list();
