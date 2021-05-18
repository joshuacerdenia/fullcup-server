const express = require('express');
const app = express();
const moment = require('moment');
const calendarRoutes = require('./routes/calendar');
const cors = require('cors');

// Google stuff
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
// ***

const {authorize, getAccessToken} = require('./helpers/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api/calendar', calendarRoutes);

app.get('/', (req, res) => {
	const message = "Server online.";
	console.log(message);
	res.send(message);
});

app.listen(4000, () => {
	console.log('We are up and running.')
});

/*
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  const credentials = JSON.parse(content);
  authorize(credentials, getFreeTimes);
});*/

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}

function getFreeBusy(auth, calendarIds) {
	const date = new Date();
	const calendar = google.calendar({version: 'v3', auth});
  const params = { requestBody: {
    timeMin: moment().format(),
    timeMax: moment().add(5, 'days').format(),
    items: calendarIds.map((calendar) => {
      return { id: calendar }
    })
  }}
	calendar.freebusy.query(params, (err, res) => {
		if (err) return console.log(err);
    const calendars = res.data.calendars;
    
    calendarIds.forEach((id) => {
      console.log('Got calendar: ' + id);
      console.log('Busy times in the next five days:')
      
      if (calendars[id].busy.length === 0) {
        console.log('None.')
      } else {
        calendars[id].busy.forEach((time) => {
          const start = moment(time.start).format('LLLL');
          const end = moment(time.end).format('LLLL');
          console.log(start + ' to ' + end);
        });
      }
      console.log('***');
    });
	});
}

function getCalendars(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  let calendars = [];
  calendar.calendarList.list((err, res) => {
    if (err) return console.log(err);
    const calendarIds = res.data.items.map((cal) => cal.id); 
    // getFreeBusy(auth, calendars);
    calendarIds.forEach((id) => calendars.push(id));
  });
  return calendars;
}

function getCalendarList(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  return calendar.calendarList.list((err, res) => {
    if (err) return console.log(err);
    return res.data.items.map((cal) => {
      console.log(cal.id);
      return {
        id: cal.id,
        summary: cal.summary,
        description: cal.description
      }
    });
  }); 
}

async function getFreeTimes(auth) {
  const calendars = await getCalendarList(auth)
    .then((err, ) => {
      console.log(cals);
    });
  // getFreeBusy(auth, calendars);
}