import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export class GeneratorAgent {
    async generateModularTestSystem(userRequirement: string, testFileName: string): Promise<void> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("❌ GEMINI_API_KEY missing in .env");

        console.log(`🧠 [Gemini 3.5 Flash-Lite Architect]: Analyzing requirement & ensuring zero regressions...`);

        // Read existing page objects if they exist so the AI preserves their methods
        const pagesDir = path.join(__dirname, '../pages');
        const loginPath = path.join(pagesDir, 'login.page.ts');
        const existingLoginCode = fs.existsSync(loginPath) ? fs.readFileSync(loginPath, 'utf-8') : '';

        const prompt = `You are an elite enterprise Playwright architect using TypeScript. 
Create or update a modular test spec for: "${userRequirement}".

EXISTING LOGIN PAGE CODE (You MUST preserve all existing methods like login(), navigate(), and add any new requested methods like getErrorMessageText without deleting old ones):
${existingLoginCode}

Return your response as a valid JSON object containing 5 keys. NO markdown formatting, raw JSON only:
{
  "testData": "TypeScript content for src/data/test-data.ts",
  "loginPage": "Updated TypeScript content for src/pages/login.page.ts keeping all old methods intact",
  "inventoryPage": "TypeScript content for src/pages/inventory.page.ts",
  "checkoutPage": "TypeScript content for src/pages/checkout.page.ts",
  "testSpec": "TypeScript content for src/tests/${testFileName}"
}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`Gemini API failed with status ${response.status}`);

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const files = JSON.parse(rawText.trim().replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '').trim());

        const dataDir = path.join(__dirname, '../data');
        const testsDir = path.join(__dirname, '../tests');

        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });
        if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });

        // Safely write files
        fs.writeFileSync(path.join(dataDir, 'test-data.ts'), files.testData);
        fs.writeFileSync(loginPath, files.loginPage);
        fs.writeFileSync(path.join(pagesDir, 'inventory.page.ts'), files.inventoryPage);
        fs.writeFileSync(path.join(pagesDir, 'checkout.page.ts'), files.checkoutPage);
        fs.writeFileSync(path.join(testsDir, testFileName), files.testSpec);

        console.log(`✨ [Generator Agent]: Successfully generated test and synchronized page models!`);
    }
}