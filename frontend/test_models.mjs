const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBZI1mGJI_RTsBZ6aNCgKkkixZokugOwN8";

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      console.error("Failed:", data);
      return;
    }
    console.log("AVAILABLE MODELS:");
    data.models.forEach(m => {
      console.log(`- ${m.name}`);
      if (m.name.includes("gemini")) {
          console.log(`  Supported generation methods: ${m.supportedGenerationMethods.join(', ')}`);
      }
    });
  } catch (e) {
    console.error("Error fetching models:", e);
  }
}

listModels();
