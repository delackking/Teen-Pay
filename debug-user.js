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
        console.log("Checking user 'delack@teen'...");
        const user = await prisma.user.findUnique({
            where: { teenId: 'delack@teen' }
        });

        if (user) {
            console.log("User found:", user);
        } else {
            console.log("User 'delack@teen' not found.");
        }

        console.log("\nAll users:");
        const allUsers = await prisma.user.findMany();
        console.log(allUsers);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
