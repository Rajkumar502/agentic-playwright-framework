import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

async function runCoverageGapAgent() {
    console.log(`🔍 [Coverage Gap Agent]: Scanning Jira backlog and local test repository...`);

    const testsDir = path.resolve(process.cwd(), 'src/tests');
    if (!fs.existsSync(testsDir)) {
        fs.mkdirSync(testsDir, { recursive: true });
    }

    // 1. Get list of existing test files
    const existingTestFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.spec.ts'));
    console.log(`📁 [Repository Audit]: Found ${existingTestFiles.length} existing test specification files.`);

    // 2. Fetch open/untested tickets from Jira backlog
    console.log(`🔗 [Jira API]: Fetching active backlog tickets...`);
    const openTickets = await fetchJiraBacklogTickets();

    if (openTickets.length === 0) {
        console.log(`✨ [Coverage Gap Agent]: Backlog is empty or all tickets are accounted for.`);
        return;
    }

    console.log(`📋 [Jira Audit]: Retrieved ${openTickets.length} open requirements from Jira.`);

    // 3. Use Gemini Flash-Lite to perform Gap Analysis
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error(`❌ GEMINI_API_KEY missing in .env`);

    const analysisPrompt = `
    You are an expert Autonomous QA Director.
    Here is the list of existing Playwright test files in our repository:
    ${JSON.stringify(existingTestFiles, null, 2)}

    Here is the current list of open Jira backlog tickets:
    ${JSON.stringify(openTickets, null, 2)}

    Task: Analyze which Jira tickets lack a corresponding automated test file. 
    Select the highest-priority uncovered ticket that should be automated next.
    
    Return a valid JSON object with ONLY these keys:
    {
      "hasGap": true/false,
      "targetTicketKey": "e.g., SCRUM-5",
      "reason": "Brief explanation of why this ticket lacks test coverage"
    }
    Do not include markdown code blocks or backticks. Return raw JSON only.
    `;

    console.log(`🧠 [Gemini QA Director]: Analyzing coverage gaps...`);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: analysisPrompt }] }] })
    });

    if (!response.ok) throw new Error(`Gemini API failed with status ${response.status}`);

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJsonText = rawText.trim().replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '').trim();
    const gapResult = JSON.parse(cleanJsonText);

    if (!gapResult.hasGap || !gapResult.targetTicketKey) {
        console.log(`✨ [Coverage Gap Agent]: 100% Test Coverage achieved! No gaps found in backlog.`);
        return;
    }

    console.log(`🚨 [Coverage Gap Detected]: Ticket **${gapResult.targetTicketKey}** lacks test coverage!`);
    console.log(`📝 [Reason]: ${gapResult.reason}`);

    // 4. Proactively Trigger the Autonomous SDLC Pipeline for the Uncovered Ticket
    console.log(`🚀 [Proactive Automation]: Automatically triggering pipeline for ${gapResult.targetTicketKey}...`);
    execSync(`npm run generate:ticket ${gapResult.targetTicketKey}`, { stdio: 'inherit' });
}

async function fetchJiraBacklogTickets(): Promise<any[]> {
    const jiraUrl = process.env.JIRA_URL;
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraToken = process.env.JIRA_API_TOKEN;

    if (!jiraUrl || !jiraEmail || !jiraToken) {
        throw new Error(`❌ Jira credentials missing in .env!`);
    }

    const credentials = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');
    const jql = encodeURIComponent('status != Done ORDER BY created DESC');
    
    // 🛡️ Updated to the new Jira Cloud /rest/api/3/search/jql endpoint
    const response = await fetch(`${jiraUrl}/rest/api/3/search/jql?jql=${jql}&maxResults=10`, {
        method: 'GET',
        headers: { 'Authorization': `Basic ${credentials}`, 'Accept': 'application/json' }
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Failed to fetch Jira backlog. Status: ${response.status} - ${errBody}`);
    }

    const data = await response.json() as any;
    return (data.issues || []).map((issue: any) => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name
    }));
}

runCoverageGapAgent();