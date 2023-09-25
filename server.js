require('dotenv').config()
const express = require('express');
const cors = require('cors')
const app = express();

const {
    getData,
    updateData,
    getEnteredUser
} = require('./db.queries')

const port = process.env.PORT || 4000;

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/scanner"))

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/scanner/index.html");
});

app.get('/entered', (req, res) => {
    res.sendFile(__dirname + "/scanner/entry.html");
});

app.get('/user-entry', async (req, res) => {
    let enteredUsers = await getEnteredUser();
    res.status(200).json(enteredUsers);
})

app.get('/verify-user', async (req, res) => {
    let { uid, email } = req.query;
    console.log(uid, email)
    let result = await getData(uid, email);
    console.log(result.length);
    if (result.length === 1 && uid && email) {
        if (!result[0].entered) {
            await updateData(uid)
            return res.status(200).json({ status: "authorized" })
        }
        else return res.status(401).json({ status: "entered" })
    }
    else return res.status(401).json({ status: "unauthorized" })
})

app.listen(port, () => {
    console.log(`Server running at ${port}`)
})
