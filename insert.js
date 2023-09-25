const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const xlsx = require('xlsx');

// this will removed after maintainance
const insertDemo = async (users) => {
    return await prisma.user.createMany({
        data: users
    })
}

// removeval code
const myData = []
const readCsv = async () => {
    // Load the Excel file
    const workbook = xlsx.readFile('Data.xlsx');

    // Choose the worksheet you want to read from
    const worksheet = workbook.Sheets['Sheet1']; // Change 'Sheet1' to your actual sheet name

    // Parse the data from the worksheet
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Print the data
    // console.log(data);
    data.forEach((item) => {
        let year=item.year?`${item.year}`:""
        let rowData = {
            uid: `${item.batch.toUpperCase()}-${require('crypto').randomBytes(4).toString('hex')}`,
            ...item,
            year: year,
            entered:false
        }
        myData.push(rowData)
    })
    console.log(myData)
    // await insertDemo(myData); // Pushing the data
    return myData;
}

module.exports = {
    readCsv
}