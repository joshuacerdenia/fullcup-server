const express = require('express')
const router = express.Router();
const EventsController = require('../controllers/events');

router.get('/get-events', (req, res) => {
  EventsController
  .getEvents(undefined)
  .then((result) => res.send(result));
});

router.post('/sync-events', (req, res) => {
  const events = req.body.events;
  const idsForDeletion = req.body.idsForDeletion;
  EventsController
  .syncEvents(events, idsForDeletion)
  .then((result) => res.send(result));
});

module.exports = router;