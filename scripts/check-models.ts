// npx ts-node --skip-project scripts/check-models.ts
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function check() {
    console.log("Checking Gemini Models...");
    const key = process.env.GEMINI_API_KEY || "AIzaSyDyy_E4jbsQ8JFT1HyYvVCoxwMHsIhmPQo";
    console.log("Using Key (last 4):", key.slice(-4));

    try {
        const genAI = new GoogleGenerativeAI(key);
        // Note: listModels is on the genAI instance or model manager? 
        // In verify 0.1.x it was different. In 0.24.x it via getGenerativeModel usually doesn't have list.
        // Actually it is usually via a separate admin call or rest.
        // Let's try a simple generation with "gemini-1.5-flash" to see specific error detail.

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success! gemini-1.5-flash is working.");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Error connecting:", e.message);
        if (e.response) {
            console.error("Details:", e.response);
        }
    }
}

check();
