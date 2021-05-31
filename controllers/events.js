const {google} = require('googleapis');
const moment = require('moment');
const {getAuthorization} = require('../helpers/auth');
const {getRecurrenceRule} = require('../helpers/recurrence');

// Authorize access to Google Calendar.
const googleCalendar = () => {
  const auth = getAuthorization();
  return google.calendar({ version: 'v3', auth });
}

// Return a list of the next 10 scheduled events
// from the moment the request is made.
function getEvents(calendarId = 'primary') {
  const gc = googleCalendar();
  return gc.events
  .list({
    calendarId: calendarId,
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  })
  .then((res) => {
    const events = res.data.items.map((event) => {
      return {
        summary: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime,
        creator: event.creator
      }  
    });
    
    return events;
  })
  .catch((res) => res.errors);
}

// Adds one event to a user's primary calendar.
// Returns the ID of the added event.
function addEvent(event) {
  const gc = googleCalendar();
  return gc.events.insert({
    calendarId: 'primary',
    resource: event,
  })
  .then((res) => {
    return { id: res.data.id, summary: res.data.summary }
  })
  .catch((res) => res.errors);
}

// Updates an existing event in the primary calendar.
// Returns the ID of the updated event.
function patchEvent(event) {
  const gc = googleCalendar();
  return gc.events.patch({
    calendarId: 'primary',
    eventId: event.id,
    resource: event
  })
  .then((res) => {
    return { id: res.data.id, summary: res.data.summary }
  })
  .catch((res) => res.errors);
}

function deleteEvent(eventId) {
  const gc = googleCalendar()
  return gc.events.delete({
    calendarId: 'primary',
    eventId: eventId
  })
  .then((res) => true)
  .catch((res) => false);
}

async function syncEvents(rawEvents = [], idsToDelete = []) {
  const fullCupEvents = [];

  // Map raw events to GoogleCalendar's expected format.
  const events = rawEvents.map((rawEvent) => {
    return {
      id: rawEvent.googleId,
      summary: rawEvent.summary,
      start: { 
        dateTime: moment(rawEvent.start).format(),
        timeZone: rawEvent.timeZone
      },
      end: { 
        dateTime: moment(rawEvent.start)
        .add(rawEvent.durationInMins, 'minutes')
        .format(),
        timeZone: rawEvent.timeZone
      },
      recurrence: getRecurrenceRule(rawEvent.recurrence)
    }
  });

  if (idsToDelete.length > 0) {
    for (let i = 0; i < idsToDelete.length; i++) {
      const res = await deleteEvent(idsToDelete[i]);
      // Save response?
    }
  }

  for (let i = 0; i < events.length; i++) {
    if (!events[i].id) {
      // If no ID, the event doesn't exist yet on GoogleCal.
      const eventCreated = await addEvent(events[i]);
      fullCupEvents.push(eventCreated);
    } else {
      // If ID exists, patch the event instead.
      const eventPatched = await patchEvent(events[i]);
      fullCupEvents.push(eventPatched)
    }
  }

  return { results: fullCupEvents }
}

module.exports = {
  getEvents,
  syncEvents,
}