const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
	const message = "Server online.";
	console.log(message);
	res.send(message);
});

app.listen(4000, () => {
	console.log('We are up and running.')
});