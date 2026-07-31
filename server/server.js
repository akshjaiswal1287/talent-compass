const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { prepareResumeForScreening, validateScreening } = require("./privacy");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/screen", async (req, res) => {
  try {
    const resumeText = prepareResumeForScreening(req.body?.resumeText);

    // Target the fast, free-tier model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // This forces Gemini to respond in raw JSON format
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
            You are an automated hiring system parsing a resume. 
            Analyze the following text and perform these actions:
            1. Extract the top 5 technical skills.
            2. Calculate total years of experience.
            3. Score the resume from 0 to 100 based on overall technical depth.
            4. CRITICAL: Do not include names, emails, phone numbers, or addresses in the output.

            You must return your response matching this JSON schema exactly:
            {
                "score": number,
                "skills": ["string"],
                "experience_years": number
            }

            Redacted resume text to analyze:
            ${resumeText}
        `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the string from Gemini into a real JS object to send back
    res.json(validateScreening(JSON.parse(responseText)));
  } catch (error) {
    console.error("Gemini Error:", error);
    const status = error.message?.includes("required") || error.message?.includes("characters") ? 400 : 500;
    res.status(status).json({ error: status === 400 ? error.message : "Failed to process resume with AI" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
