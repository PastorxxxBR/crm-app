const { GoogleGenerativeAI } = require("@google/generative-ai");
const key = "AIzaSyDyy_E4jbsQ8JFT1HyYvVCoxwMHsIhmPQo"; // User provided key

async function check() {
    console.log("Checking Gemini Models with Key:", key.slice(-4));
    const genAI = new GoogleGenerativeAI(key);

    // List of models to try
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

    for (const modelName of models) {
        console.log(`\nAttempting ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test connection");
            console.log(`✅ SUCCESS! ${modelName} is working.`);
            return; // Exit on first success
        } catch (e) {
            console.error(`❌ FAIL ${modelName}:`, e.message.split(' ')[0] + "..."); // Short error
        }
    }
    console.log("\nNo working models found.");
}

check();
