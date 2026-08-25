import dotenv from 'dotenv';
dotenv.config();

export class JiraClient {
    private static getAuthHeaders() {
        const jiraEmail = process.env.JIRA_EMAIL;
        const jiraToken = process.env.JIRA_API_TOKEN;
        if (!jiraEmail || !jiraToken) {
            throw new Error("Jira credentials missing in .env");
        }
        return {
            'Authorization': `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    static async addComment(issueKey: string, commentBody: string): Promise<void> {
        const jiraUrl = process.env.JIRA_URL;
        if (!jiraUrl) return;

        const url = `${jiraUrl}/rest/api/3/issue/${issueKey}/comment`;
        const body = {
            body: {
                type: 'doc',
                version: 1,
                content: [{ type: 'paragraph', content: [{ type: 'text', text: commentBody }] }]
            }
        };

        try {
            await fetch(url, { method: 'POST', headers: this.getAuthHeaders(), body: JSON.stringify(body) });
            console.log(`💬 [Jira Sync]: Added comment to ${issueKey}`);
        } catch (error: any) {
            console.error(`❌ [Jira Sync Error]: ${error.message}`);
        }
    }

    /**
     * Updates the status of a Jira ticket (e.g., moves it to Done when tests pass)
     */
    static async transitionTicket(issueKey: string, targetStatusName: string): Promise<void> {
        const jiraUrl = process.env.JIRA_URL;
        if (!jiraUrl) return;

        try {
            const transitionsRes = await fetch(`${jiraUrl}/rest/api/3/issue/${issueKey}/transitions`, {
                method: 'GET',
                headers: (this as any).getAuthHeaders()
            });
            if (!transitionsRes.ok) return;

            const data = await transitionsRes.json() as any;
            const transition = data.transitions?.find((t: any) => 
                t.name.toLowerCase() === targetStatusName.toLowerCase()
            );

            if (!transition) return;

            await fetch(`${jiraUrl}/rest/api/3/issue/${issueKey}/transitions`, {
                method: 'POST',
                headers: (this as any).getAuthHeaders(),
                body: JSON.stringify({ transition: { id: transition.id } })
            });
            console.log(`✅ [Jira Sync]: Moved ticket ${issueKey} status to "${targetStatusName}"`);
        } catch (error) {
            // Silently handle transition error if workflow state differs
        }
    }

    // Add this inside your JiraClient class in src/utils/jira-client.ts
    static async createBugTicket(projectKey: string, summary: string, description: string): Promise<string> {
    const jiraUrl = process.env.JIRA_URL;
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraToken = process.env.JIRA_API_TOKEN;

    if (!jiraUrl || !jiraEmail || !jiraToken) {
        throw new Error(`❌ Jira credentials missing in .env!`);
    }

    const credentials = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');
    
    // Extract project prefix (e.g., 'SCRUM' from 'SCRUM-3')
    const response = await fetch(`${jiraUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                project: { key: projectKey },
                summary: `[AI Bug Report] ${summary}`,
                description: {
                    type: "doc",
                    version: 1,
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", text: description }]
                        }
                    ]
                },
                issuetype: { name: "Bug" }
            }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to create Jira bug ticket. Status: ${response.status} - ${errText}`);
    }

    const data = await response.json() as any;
    console.log(`🐛 [Jira API]: Automatically created defect ticket: ${data.key}`);
    return data.key;
    }
}