const express = require('express')
const router = express.Router();
const CalendarController = require('../controllers/calendar');

router.get('/get-calendar-list', (req, res) => {
	CalendarController
		.getCalendarList()
		.then((result) => res.send(result));
});

router.get('/get-busy-times', (req, res) => {
	const {calendars, days} = req.body;
	CalendarController
		.getBusyTimes(calendars, days) // for testing only
		.then((result) => res.send(result));
});

router.get('/get-events', (req, res) => {
	CalendarController
		.getEvents(undefined)
		.then((result) => res.send(result));
});

module.exports = router;