const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getData = async (uid, email) => {
    try {
        return await prisma.user.findMany({
            where: {
                uid: uid,
                email: email
            }
        })
    } catch (err) {
        console.log({ code: err.code, message: err.message })
    } finally {
        prisma.$disconnect();
    }
}

const updateData = async (uid) => {
    console.log(uid)
    try {
        return await prisma.user.update({
            where: {
                uid: uid
            },
            data: {
                entered: true
            },
        })
    } catch (err) {
        console.log({ code: err.code, message: err.message })
    } finally {
        prisma.$disconnect();
    }
}

const getEnteredUser = async () => {
    try {
        return await prisma.user.findMany({
            where: {
                entered: true,
            }
        })
    } catch (err) {
        console.log({ code: err.code, message: err.message })
    } finally {
        prisma.$disconnect();
    }
}

module.exports = {
    getData,
    updateData,
    getEnteredUser
}