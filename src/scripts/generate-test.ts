import { GeneratorAgent } from '../agents/generator';

async function run() {
    const requirement = process.argv[2] || 
        "Test SauceDemo login with standard_user and secret_sauce, add the Sauce Labs Backpack to the cart, navigate to cart, proceed to checkout with First Name John, Last Name Doe, and Postal Code 12345, complete the checkout process, and verify that the order completion header says Thank you for your order!";
    
    const fileName = process.argv[3] || "generated-checkout-pom.spec.ts";

    console.log("🚀 Initializing Generator Architect Agent...");
    const generator = new GeneratorAgent();
    
    try {
        await generator.generateModularTestSystem(requirement, fileName);
        console.log("✅ Complete POM system generation successful!");
    } catch (error: any) {
        console.error(`❌ Failed to generate modular system: ${error.message}`);
        process.exit(1);
    }
}

run();