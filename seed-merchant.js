const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "file:./dev.db"
        }
    }
});

async function main() {
    try {
        // 1. Get Developer User
        const user = await prisma.user.findUnique({
            where: { teenId: 'developer@teen' }
        });

        if (!user) {
            console.log("Developer user not found. Run backfill first.");
            return;
        }

        // 2. Create Merchant
        const apiKey = 'rzp_test_' + crypto.randomBytes(8).toString('hex');
        const secretKey = crypto.randomBytes(16).toString('hex');

        const merchant = await prisma.merchant.create({
            data: {
                name: "Toy Store",
                apiKey: apiKey,
                secretKey: secretKey,
                userId: user.id
            }
        });

        console.log("Merchant Created!");
        console.log("Name:", merchant.name);
        console.log("API Key:", merchant.apiKey);
        console.log("Secret Key:", merchant.secretKey);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
