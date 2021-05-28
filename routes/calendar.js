const express = require('express')
const router = express.Router();
const CalendarController = require('../controllers/calendar');

router.get('/get-calendar-list', (req, res) => {
  CalendarController
  .getCalendarList()
  .then((result) => res.send(result));
});

router.post('/get-busy-times', (req, res) => {
  const {calendars, days} = req.body;
  CalendarController
  .getBusyTimes(calendars, days)
  .then((result) => res.send(result));
});

router.post('/get-all-busy-times', (req, res) => {
  const days = req.body.days;
  CalendarController
  .getAllBusyTimes(days)
  .then((result) => res.send(result));
})

router.get('/get-events', (req, res) => {
  CalendarController
  .getEvents(undefined)
  .then((result) => res.send(result));
});

router.post('/add-calendar', (req, res) => {
  CalendarController
  .addCalendar()
  .then((result) => res.send(result));
});

router.post('/add-event', (req, res) => {
  const event = req.body.event;
  CalendarController
  .addEvent(event)
  .then((result) => res.send(result));
});

router.post('/add-events', (req, res) => {
  const events = req.body.events
  CalendarController
  .addEvents(events)
  .then((result) => res.send(result));
})

// Just for testing
router.post('/post-test', (req, res) => {
	console.log("Got request:");
	console.log(req.body);
	res.send({ response: "OK" });
})


module.exports = router;