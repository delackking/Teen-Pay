import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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
    console.log({ developer })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
