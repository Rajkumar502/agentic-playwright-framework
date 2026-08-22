import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const CACHE_PATH = path.join(__dirname, '../utils/healing-cache.json');

export class HealerAgent {
    static getCachedSelector(failingSelector: string): string | null {
        if (!fs.existsSync(CACHE_PATH)) return null;
        const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        return cache[failingSelector] || null;
    }

    static saveHealedSelector(failingSelector: string, newSelector: string): void {
        let cache: any = {};
        if (fs.existsSync(CACHE_PATH)) {
            cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        }
        cache[failingSelector] = newSelector;
        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
        console.log(`🤖 [Gemini 3.5 Flash-Lite Healer]: Successfully healed and cached: "${failingSelector}" -> "${newSelector}"`);
    }

    /**
     * Uses Gemini 3.5 Flash-Lite via the Google Generative Language API to analyze the DOM snippet and heal the selector.
     */
    async healLocatorWithLLM(failingSelector: string, domSnippet: string): Promise<string> {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.warn("⚠️ [Gemini AI Healer]: GEMINI_API_KEY is missing in .env. Falling back to default selector.");
            return '#login-button';
        }

        console.log(`🧠 [Gemini 3.5 Flash-Lite]: Analyzing compact DOM snippet to heal selector: "${failingSelector}"...`);

        try {
            const prompt = `You are an elite Playwright test automation expert. A test failed because the CSS selector "${failingSelector}" could not be found. 
Here is a compact HTML snippet of the parent form container:
${domSnippet}

Analyze this HTML and return ONLY the correct valid CSS selector for the intended button or element. Do not include markdown formatting, backticks, quotes, or conversational text. Return just the raw selector string.`;

            // Using the ultra-efficient Gemini 3.5 Flash-Lite model endpoint
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API returned status ${response.status}`);
            }

            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            // Clean up any accidental markdown or whitespace returned by the model
            const healedSelector = rawText.trim().replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();

            if (!healedSelector) {
                throw new Error("Empty response received from Gemini API.");
            }

            console.log(`✨ [Gemini 3.5 Flash-Lite]: AI computed healed selector: "${healedSelector}"`);
            HealerAgent.saveHealedSelector(failingSelector, healedSelector);
            return healedSelector;

        } catch (error: any) {
            console.error(`❌ [Gemini AI Healer Error]: ${error.message}. Falling back to default selector.`);
            const fallbackSelector = '#login-button';
            HealerAgent.saveHealedSelector(failingSelector, fallbackSelector);
            return fallbackSelector;
        }
    }
}