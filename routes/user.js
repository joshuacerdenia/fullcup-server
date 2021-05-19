const express = require('express')
const router = express.Router();
const UserController = require('../controllers/user');

router.post('/verify', (req, res) => {
	UserController
		.verify() // testing only
		.then((result) => res.send(result));
});

module.exports = router;