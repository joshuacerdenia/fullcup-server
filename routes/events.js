const express = require('express')
const router = express.Router();
const EventsController = require('../controllers/events');

router.get('/get-events', (req, res) => {
  EventsController
  .getEvents(undefined)
  .then((result) => res.send(result));
});

router.post('/add-event', (req, res) => {
  const event = req.body.event;
  EventsController
  .addEvent(event)
  .then((result) => res.send(result));
});

router.post('/add-events', (req, res) => {
  const events = req.body.events
  EventsController
  .addEvents(events)
  .then((result) => res.send(result));
});

module.exports = router;