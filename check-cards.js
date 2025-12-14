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
        const users = await prisma.user.findMany({
            select: {
                name: true,
                teenId: true,
                cardNumber: true,
                cvv: true,
                expiryDate: true
            }
        });
        console.log("User Card Details:");
        users.forEach(u => {
            console.log(`${u.name} (${u.teenId}): Card='${u.cardNumber}' CVV='${u.cvv}' Exp='${u.expiryDate}'`);
        });
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
