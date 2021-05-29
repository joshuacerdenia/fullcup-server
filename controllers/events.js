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
    calendarId: 'primary', // change later
    resource: event,
  })
  .then((res) => {
    return { id: res.data.id, summary: res.data.summary }
  })
  .catch((res) => res.errors);
}


async function addEvents(rawEvents = []) {
  const eventsCreated = [];
  const events = rawEvents.map((rawEvent) => {
    let recurrence = null;

    if (rawEvent.recurrence === "daily") {
      recurrence = 'FREQ=DAILY;INTERVAL=1;COUNT=7'
    }

    if (rawEvent.recurrence === "weekend") {
      recurrence = 'FREQ=WEEKLY;BYDAY=FR,SA;INTERVAL=1;COUNT=2'
    }

    if (rawEvent.recurrence === "weekday") {
      recurrence = 'RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH;INTERVAL=1;COUNT=5'
    }

    return {
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
      recurrence: [`RRULE:${recurrence}`]
    }
  });

  for (let i = 0; i < events.length; i++) {
    const eventCreated = await this.addEvent(events[i]);
    eventsCreated.push(eventCreated);
  }

  return { results: eventsCreated }
}

module.exports = {
	getEvents,
	addEvent,
	addEvents
}