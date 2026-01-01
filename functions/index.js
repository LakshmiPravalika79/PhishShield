const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require('cors');
const corsHandler = cors({ origin: true });
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SAFE_BROWSING_API_KEY = process.env.SAFE_BROWSING_API_KEY;

const SYSTEM_PROMPT = `Analyze the provided input (text or image) for phishing or scam indicators. Use the following strict output format. Respond ONLY with a raw JSON object (no markdown, no extra text):

{
  "is_scam": [true|false],
  "risk_score": [0-100],
  "verdict": ["Safe"|"Caution"|"Danger"],
  "scam_category": "[KYC|Job|Bank|Other|None]",
  "red_flags": ["string", ...],
  "explanation_en": "string"
}

- "is_scam": true if any phishing or scam risk is detected, else false.
- "risk_score": Integer from 0 (no risk) to 100 (confirmed scam).
- "verdict": "Safe" (0-29), "Caution" (30-69), "Danger" (70-100).
- "scam_category": Most likely scam type or "None".
- "red_flags": List of specific suspicious features or phrases.
- "explanation_en": Concise English summary of your reasoning.
`;

exports.analyzePhishing = functions.https.onRequest( (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { imageData, text } = req.body;
      let safeBrowsingResult = null;
      let geminiResult = null;
    // 1. Google Safe Browsing API (if text is a URL)
    if (text) {
      const safeBrowsingRes = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${SAFE_BROWSING_API_KEY}`,
        {
          method: "POST",
          body: JSON.stringify({
            client: { clientId: "phishshield", clientVersion: "1.0" },
            threatInfo: {
              threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION",
              ],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [{ url: text }],
            },
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const safeBrowsingData = await safeBrowsingRes.json();
      safeBrowsingResult = !!safeBrowsingData.matches;
    }

    // 2. Gemini 1.5 Flash API
    let geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [],
        },
      ],
      system_instruction: {
        role: "system",
        parts: [{ text: SYSTEM_PROMPT }],
      },
    };
    if (imageData) {
      geminiPayload.contents[0].parts.push({
        inline_data: {
          mime_type: "image/png",
          data: imageData,
        },
      });
    }
    if (text) {
      geminiPayload.contents[0].parts.push({ text });
    }

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      }
    );
    const geminiData = await geminiRes.json();
    console.log('geminiData:', JSON.stringify(geminiData, null, 2));
    let geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    try {
      geminiResult = JSON.parse(geminiText);
    } catch {
      geminiResult = { error: "AI response parsing failed." };
    }

    // 3. Aggregate Results
    if (safeBrowsingResult) {
      geminiResult.is_scam = true;
      geminiResult.risk_score = Math.max(geminiResult.risk_score || 0, 90);
      geminiResult.verdict = "Danger";
      geminiResult.red_flags = [
        ...(geminiResult.red_flags || []),
        "URL flagged by Google Safe Browsing",
      ];
      geminiResult.explanation_en =
        (geminiResult.explanation_en || "") +
        " Google Safe Browsing flagged this URL as dangerous.";
      geminiResult.scam_category = geminiResult.scam_category || "Other";
    }
    console.log('safeBrowsingResult:', safeBrowsingResult);
    console.log('geminiResult:', geminiResult);
    res.json(geminiResult);
  } catch (e) {
    res.status(500).json({ error: "Internal error: " + e.message });
  }
});
});