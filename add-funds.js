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
        const user = await prisma.user.update({
            where: { teenId: 'developer@teen' },
            data: {
                balance: { increment: 100000 }
            }
        });
        console.log(`Added 100,000 to ${user.name}. New Balance: ${user.balance}`);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
