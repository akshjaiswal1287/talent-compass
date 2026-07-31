import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { resumeText } = req.body || {};
    if (!resumeText) return res.status(400).json({ error: "No resume text provided" });
    const geminiApiKey = process.env.GEMINI_API_KEY?.replace(/^\uFEFF/, "").trim();
    if (!geminiApiKey) return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });

    const model = new GoogleGenerativeAI(geminiApiKey).getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const prompt = `Analyze this resume. Return only JSON matching {"score": number, "skills": ["string"], "experience_years": number}. Score technical depth from 0 to 100. Do not include names, emails, phone numbers, or addresses.\n\n${resumeText}`;
    const result = await model.generateContent(prompt);
    return res.status(200).json(JSON.parse(result.response.text()));
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: "Failed to process resume with AI" });
  }
};
