import dotenv from 'dotenv';
dotenv.config();

export async function runPreFlightCheck(): Promise<void> {
    console.log("🔍 Running Pre-Flight Environment Check...");
    
    const baseUrl = process.env.BASE_URL;
    const authEndpoint = process.env.AUTH_ENDPOINT;

    if (!baseUrl) {
        console.error("❌ [ENV_ERROR]: BASE_URL is missing in .env file. Aborting.");
        process.exit(1);
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // If authEndpoint is just the base URL or a mock endpoint for public sites, just ping the base URL
        const targetUrl = (authEndpoint && authEndpoint !== baseUrl) ? authEndpoint : baseUrl;
        
        const response = await fetch(targetUrl, {
            method: 'GET', // Use GET for general site availability, or keep POST if using a real backend
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Accept standard success or redirection codes for public sites
        if (!response.ok && response.status !== 405 && response.status !== 403) {
            throw new Error(`Service returned status ${response.status}`);
        }

        console.log("✅ Pre-Flight Check Passed: Environment is healthy.");
    } catch (error: any) {
        console.error(`❌ [ENV_ERROR]: Environment unreachable (${error.message}). Aborting test run.`);
        process.exit(1);
    }
}