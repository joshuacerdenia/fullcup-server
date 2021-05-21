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
      const calendars = res.data.items.map((calendar) => {
      	return {
	        id: calendar.id,
	        summary: calendar.summary,
	        description: calendar.description
	      }
      })
      
      return { data: calendars }
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
    });
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
      
      return { data: events }
    });
}

function addCalendar() {
  const gc = googleCalendar();
  return gc.calendars
    .insert({ requestBody: { summary: "Full Cup" }})
    .then((res, err) => {
      return (err) ? false : true;
    });
}

module.exports = {
	getCalendarList,
	getBusyTimes,
  getAllBusyTimes,
  getEvents,
  addCalendar
}