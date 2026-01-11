
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

async function testGroq() {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("❌ No GROQ_API_KEY found in .env");
            return;
        }

        console.log(`Connecting with key: ${apiKey.substring(0, 5)}...`);
        const groq = new Groq({ apiKey });

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hello." }],
            model: "llama-3.3-70b-versatile",
        });

        console.log("✅ Groq Response:", completion.choices[0]?.message?.content);

    } catch (error) {
        console.error("❌ Groq Test Failed:", error.message);
        if (error.status) console.error("Status:", error.status);
    }
}

testGroq();
