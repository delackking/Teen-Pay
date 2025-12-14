const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "file:./dev.db"
        }
    }
});

function generateCardNumber() {
    let number = "4"; // Visa
    for (let i = 0; i < 15; i++) {
        number += Math.floor(Math.random() * 10);
    }
    return number.match(/.{1,4}/g).join(' ');
}

function generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
}

function generateExpiry() {
    const month = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
    const year = (new Date().getFullYear() + Math.floor(2 + Math.random() * 4)).toString().slice(-2);
    return `${month}/${year}`;
}

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: { cardNumber: null }
        });

        console.log(`Found ${users.length} users without cards.`);

        for (const user of users) {
            const cardNumber = generateCardNumber();
            const cvv = generateCVV();
            const expiryDate = generateExpiry();

            await prisma.user.update({
                where: { id: user.id },
                data: { cardNumber, cvv, expiryDate }
            });
            console.log(`Generated card for ${user.teenId}`);
        }

        console.log("Backfill complete.");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
