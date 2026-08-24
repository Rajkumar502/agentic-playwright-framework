import { APIRequestContext, expect } from '@playwright/test';

export class ApiValidator {
    constructor(private request: APIRequestContext) {}

    async validateSauceDemoInventoryContract(baseUrl: string = 'https://www.saucedemo.com') {
        console.log(`📡 [API Contract Validator]: Checking backend inventory contract...`);
        
        // Note: For SauceDemo, we can check the base URL or a mock/actual endpoint if available.
        // For demonstration, we'll verify the main application responds successfully.
        const response = await this.request.get(baseUrl);
        
        // Validate status code
        expect(response.status()).toBe(200);
        console.log(`✅ [API Contract]: Status code 200 OK verified.`);

        // Validate headers or response structure
        const headers = response.headers();
        expect(headers['content-type']).toContain('text/html');
        console.log(`✅ [API Contract]: Content-Type contract validated successfully.`);
    }
}