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
        console.log("Attempting to connect to database...");
        const userCount = await prisma.user.count();
        console.log(`Connection successful! Found ${userCount} users.`);

        const users = await prisma.user.findMany();
        console.log("Users:", users);
    } catch (e) {
        console.error("Database connection failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
