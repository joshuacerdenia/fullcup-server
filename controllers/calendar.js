const {google} = require('googleapis');
const fs = require('fs');
const {getAuthorization, getAccessToken} = require('../helpers/auth');
const moment = require('moment');

const googleCalendar = () => {
  // Load client secrets from local file
  const cred = JSON.parse(fs.readFileSync('credentials.json'));
  // Authorize a client with credentials
  const auth = getAuthorization(cred);
  // Call Google Calendar API
  return google.calendar({version: 'v3', auth});
}

function getCalendarList() {
	const gc = googleCalendar();
  return gc.calendarList
    .list()
    .then((res, err) => {
      if (err) return false;
      return res.data.items.map((calendar) => {
        return {
          id: calendar.id,
          summary: calendar.summary,
          description: calendar.description
        }
      });    
    });
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
    .then((res, err) => {
      if (err) return false;
      return res.data.calendars;
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
    .then((res, err) => {
      if (err) return false;
      const events = res.data.items.map((event) => {
        return {
          summary: event.summary,
          start: event.start.dateTime,
          end: event.end.dateTime,
          creator: event.creator
        }  
      });
      return events;
    });
}

module.exports = {
	getCalendarList,
	getBusyTimes,
  getEvents
}