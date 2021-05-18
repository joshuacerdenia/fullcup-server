const express = require('express')
const router = express.Router();
const CalendarController = require('../controllers/calendar');

router.get('/get-calendar-list', (req, res) => {
	CalendarController
		.getCalendarList()
		.then((result) => res.send(result));
});

router.get('/get-free-times', (req, res) => {
	CalendarController
		.getBusyTimes(['joshcerdenia@gmail.com'])
		.then((result) => res.send(result));
})

module.exports = router;