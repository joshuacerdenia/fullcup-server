const {google} = require('googleapis');
const {getAuthorization} = require('../helpers/auth');
const moment = require('moment');

const googleCalendar = () => {
  // Authorize access to Google Calendar.
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
    
    return { results: calendars }
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
      results: busyTimes.sort((a, b) => { 
        return new Date(a.start) - new Date(b.start)
      }) 
    }
  })
  .catch((res) => res.errors);
}

function getAllBusyTimes(days) {
  return this.getCalendarList()
  .then((calendars) => {
    return (calendars.results) 
    ? getBusyTimes(calendars.results, days) 
    : { results: false }
  });
}

function addCalendar() {
  const gc = googleCalendar();
  return gc.calendars
  .insert({ requestBody: { summary: "Full Cup" }})
  .then((res) => res.status)
  .catch((res) => res.errors);
}

module.exports = {
  getCalendarList,
  getBusyTimes,
  getAllBusyTimes,
  addCalendar,
}