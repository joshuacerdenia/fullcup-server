const express = require('express');
const app = express();
const fs = require('fs');
const {authorize} = require('./helpers/auth');
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/calendar', require('./routes/calendar'));

app.get('/', (req, res) => res.send("Server online."));
app.listen(4000, () => console.log('We are up and running!'));

authorize(JSON.parse(fs.readFileSync('credentials.json')));