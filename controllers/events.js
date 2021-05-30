const {google} = require('googleapis');
const {getAuthorization} = require('../helpers/auth');
const moment = require('moment');

const googleCalendar = () => {
  // Authorize access to Google Calendar.
  const auth = getAuthorization();
  return google.calendar({ version: 'v3', auth });
}

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
    
    return { results: events }
  })
  .catch((res) => res.errors);
}

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

  const events = rawEvents.map((rawEvent) => {
    const recurrence = [];

    if (rawEvent.recurrence === "daily") {
      recurrence.push('RRULE:FREQ=DAILY;INTERVAL=1;COUNT=7')
    }

    if (rawEvent.recurrence === "weekend") {
      recurrence.push('RRULE:FREQ=WEEKLY;BYDAY=SA,SU;INTERVAL=1;COUNT=2')
    }

    if (rawEvent.recurrence === "weekday") {
      recurrence.push('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;INTERVAL=1;COUNT=5')
    }

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
      recurrence: recurrence
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