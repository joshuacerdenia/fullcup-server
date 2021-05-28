const {google} = require('googleapis');
const {getAuthorization} = require('../helpers/auth');
const moment = require('moment');
const momentTZ = require('moment-timezone');

const googleCalendar = () => {
  // Authorize access to Google Calendar
  const auth = getAuthorization();
  return google.calendar({ version: 'v3', auth });
}

function getCalendarList() {
  const gc = googleCalendar();
  return gc.calendarList
  .list()
  .then((res) => {
    const calendars = res.data.items.map((calendar) => {
      return {
        id: calendar.id,
        summary: calendar.summary,
        description: calendar.description
      }
    })
    
    return { data: calendars }
  })
  .catch((res) => res.errors);
}

function getBusyTimes(calendars = [], days) {
  const gc = googleCalendar();
  return gc.freebusy
  .query({ requestBody: {
    timeMin: moment().format(),
    timeMax: moment().add(days, 'days').format(),
    items: calendars.map((calendar) => {
      return { id: calendar.id }
    })}
  })
  .then((res) => {
    // Get a flat array of busy times across all given calendars
    const busyTimes = [];
    for (const id in res.data.calendars) {
      res.data.calendars[id].busy.forEach((busyTime) => {
        if (!busyTimes.includes(busyTime)) busyTimes.push({
          start: moment(busyTime.start).format(),
          end: moment(busyTime.end).format()
        });
      })
    };
    
    return { 
      data: busyTimes.sort((a, b) => { 
        return new Date(a.start) - new Date(b.start)
      }) 
    }
  })
  .catch((res) => res.errors);
}

function getAllBusyTimes(days) {
  return this.getCalendarList()
  .then((calendars) => {
    return (calendars.data) ? getBusyTimes(calendars.data, days) : false
  });
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
    
    return { data: events }
  })
  .catch((res) => res.errors);
}

function addCalendar() {
  const gc = googleCalendar();
  return gc.calendars
  .insert({ requestBody: { summary: "Full Cup" }})
  .then((res) => res.status)
  .catch((res) => res.errors);
}

function addEvent(event) {
  const gc = googleCalendar();
  return gc.events.insert({
    calendarId: 'primary', // change later
    resource: event,
  })
  .then((res) => true)
  .catch((res) => res.errors);
}

async function addEvents(rawEvents = []) {
  const responses = [];
  
  const events = rawEvents.map((rawEvent) => {
    const recurrence = [];

    if (rawEvent.recurrence === "everyday") {
      recurrence.push('RRULE:FREQ=DAILY;INTERVAL=1;COUNT=7')
    }

    if (rawEvent.recurrence === "weekends") {
      recurrence.push('RRULE:FREQ=WEEKLY;BYDAY=FR,SA;INTERVAL=1;COUNT=2')
    }

    if (rawEvent.recurrence === "weekdays") {
      recurrence.push('RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH;INTERVAL=1;COUNT=5')
    }

    return {
      summary: rawEvent.summary,
      start: { 
        dateTime: moment(rawEvent.start).format(),
        timeZone: momentTZ.tz.guess() 
      },
      end: { 
        dateTime: moment(rawEvent.start)
        .add(rawEvent.durationInMins, 'minutes')
        .format(),
        timeZone: momentTZ.tz.guess() 
      },
      recurrence: recurrence
    }
  });

  for (let i = 0; i < events.length; i++) {
    const response = await this.addEvent(events[i]);
    responses.push(response);
  }

  return responses;
}

module.exports = {
  getCalendarList,
  getBusyTimes,
  getAllBusyTimes,
  getEvents,
  addCalendar,
  addEvent,
  addEvents
}