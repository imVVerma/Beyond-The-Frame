import fs from 'fs';

const apiKey = "AIzaSyBZI1mGJI_RTsBZ6aNCgKkkixZokugOwN8";

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      console.error("Failed:", data);
      return;
    }
    const cleanNames = data.models.filter(m => m.name.includes('gemini')).map(m => m.name);
    fs.writeFileSync('models.json', JSON.stringify(cleanNames, null, 2));
    console.log("Saved to models.json");
  } catch (e) {
    console.error("Error fetching models:", e);
  }
}

listModels();
