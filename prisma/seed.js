const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        const developer = await prisma.user.upsert({
            where: { teenId: 'developer@teen' },
            update: {},
            create: {
                name: 'Developer',
                teenId: 'developer@teen',
                pin: '1597',
                balance: 10000,
            },
        })
        console.log('Seeding successful:', developer)
    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
