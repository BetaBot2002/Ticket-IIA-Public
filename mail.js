const { createCanvas, loadImage } = require('canvas');
const nodemailer = require('nodemailer');
const fs = require('fs');
const qrcode = require('qrcode');
const { readCsv } = require('./insert')

const width = 682;
const height = 965;

// Create a transporter using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL, // replace the main emailid
        pass: process.env.SENDER_PASS
    }
});

// Function to generate and send emails with attachments
async function generateAndSendEmail(jsonData) {
    // let uid = require('crypto').randomBytes(4).toString('hex');
    // let personId = `${jsonData.batch}-${uid}`;
    // console.log(personId)
    const data = JSON.stringify(jsonData);
    console.log(data)

    // Generate QR code
    const qrCodeOptions = { type: 'image/png' };
    const qrCodeDataURL = await qrcode.toDataURL(data, qrCodeOptions);

    // Create canvas and context
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load images
    const ticketBackImage = await loadImage(process.env.BACKGROUND_IMAGE);
    const qrCodeImage = await loadImage(qrCodeDataURL);

    // Draw images and text on canvas
    ctx.drawImage(ticketBackImage, 0, 0, width, height);
    ctx.drawImage(qrCodeImage, 220, 100, 250, 250);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${jsonData.name.length <= 10 ? 55 : 40}px sans-serif`;
    ctx.fillText(jsonData.name, width / 2, height / 2.3);
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(`${jsonData.uid}${(jsonData.year !== '' && jsonData.year !== undefined) ? " | " + jsonData.year + " Year" : ""}`, width / 2, height / 2);
    ctx.font = 'bold 30px sans-serif';
    // ctx.fillText(jsonData.year, width / 2, height / 1.5);
    ctx.fillText(jsonData.email, width / 2, height / 1.7);

    // Save canvas as image
    const cardFilePath = `Tickets-Images/${jsonData.email}_card.png`;
    const out = fs.createWriteStream(cardFilePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    // Wait for the image to finish writing
    await new Promise((resolve) => {
        out.on('finish', resolve);
    });

    // Read the image content
    const imageContent = fs.readFileSync(cardFilePath);

    // Compose email
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: jsonData.email,
        subject: 'Ticket for Teachers Day Function of IIA',
        html: `<body style="padding:10px; border-radius:20px; margin: auto; background: #1e1f35;">
        <center>
        <h2 style="text-align: center; color: red; font-weight: bold;">This is an auto generated email. For any queries please contact to admins.</h2>
        <h3 style="color: #d59ef6; font-weight: bold;">* If you have received any tickets earlier, those will not be acceptable. Kindly ignore those. This ticket will be accepted if no further tickets are issued.</h3>
        <h3 style="color: yellow; font-weight: bold;">* This ticket is for one-time use only. Kindly show this ticket at the time of entry.</h3>
        <h3 style="color: pink; font-weight: bold;">* Entry will be allowed for one person only with this ticket. Kindly do not share this ticket with anyone.</h3>
        <img src="cid:imageId" />
        </center>
        </body>
        `,
        attachments: [
            {
                filename: `${jsonData.email}_card.png`,
                content: imageContent,
                cid: 'imageId'
            }
        ]
    };

    // Send email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent to:', mailOptions.to, " => ", info.response);
    } catch (error) {
        console.log('Error:', mailOptions.to, "\n", error);
    }
}

const writeJSON = (Data_Packet) => {
    fs.writeFile('Data_Packet.json', JSON.stringify(Data_Packet, null, 4), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('JSON data has been saved to', __dirname + "/Data_Packet.json");
        }
    });
}

async function selfCall() {
    let jsonDataAll = await readCsv();
    writeJSON(jsonDataAll);
    console.log("myData", jsonDataAll)
    // Process each JSON data entry
    jsonDataAll.forEach(async (jsonData) => {
        await generateAndSendEmail(jsonData);
    });
}

selfCall()



