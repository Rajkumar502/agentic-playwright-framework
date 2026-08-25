import dotenv from 'dotenv';
dotenv.config();

export interface ReviewResult {
    approved: boolean;
    score: number; // 0 to 100
    feedback: string;
    requiredFixes: string[];
}

export class ReviewerAgent {
    async reviewCode(codeContent: string, contextFileName: string, userRequirement: string = ''): Promise<ReviewResult> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("❌ GEMINI_API_KEY missing in .env");

        console.log(`🧐 [Reviewer Agent]: Principal SDET auditing code & Jira traceability in ${contextFileName}...`);

        const prompt = `
        You are a strict Principal Software Engineer in Test (SDET) and Senior Quality Reviewer. 
        Review the following Playwright TypeScript code from file "${contextFileName}":

        \`\`\`typescript
        ${codeContent}
        \`\`\`

        JIRA REQUIREMENT & ACCEPTANCE CRITERIA TO VERIFY AGAINST:
        "${userRequirement || 'General test suite coverage'}"

        EVALUATION CRITERIA:
        1. **Acceptance Criteria Coverage**: Does the test code thoroughly cover the business logic specified in the Jira requirement above?
        2. **Web-First Assertions**: Are there any manual boolean checks (e.g., \`.isVisible()\` used in expectations) instead of auto-retrying assertions?
        3. **Locator Quality**: Are selectors robust, user-facing, and semantic (\`getByRole\`, \`getByTestId\`) rather than brittle CSS/XPath?
        4. **Type Safety & Clean Code**: Are there any \`any\` types, hardcoded waits (\`page.waitForTimeout\`), or anti-patterns?

        Return your response as a valid JSON object with ONLY these keys:
        {
          "approved": true/false (false if critical anti-patterns, manual assertions, or missing acceptance criteria are found),
          "score": number from 0 to 100,
          "feedback": "Summary of code review findings and requirement verification",
          "requiredFixes": ["List of specific fixes required if not approved, otherwise empty array"]
        }
        Do not include markdown code block formatting or backticks. Return raw JSON only.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`Gemini Reviewer API failed with status ${response.status}`);

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanJsonText = rawText.trim().replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '').trim();
        
        return JSON.parse(cleanJsonText) as ReviewResult;
    }
}