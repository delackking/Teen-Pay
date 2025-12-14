const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "file:./dev.db"
        }
    }
});

async function main() {
    try {
        // Simulate the logic from verifyPinAndPay with a negative amount
        const amount = -500;
        const senderId = "cmi9bjnjk00001"; // delack@teen (assuming ID from previous debug) - wait, I should fetch a user first

        const sender = await prisma.user.findFirst();
        if (!sender) {
            console.log("No users found");
            return;
        }
        console.log(`Testing with sender: ${sender.name} (${sender.balance})`);

        if (amount <= 0) {
            console.log("Validation check: Amount must be positive.");
        } else {
            console.log("Validation failed: Negative amount allowed.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
