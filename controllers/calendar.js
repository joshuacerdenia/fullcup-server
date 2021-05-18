const {google} = require('googleapis');
const fs = require('fs');
const {authorize, getAuthorization, getAccessToken} = require('../helpers/auth');
const moment = require('moment');

async function getCalendarList() {
	// Load client secrets from local file
	const cred = JSON.parse(fs.readFileSync('credentials.json'));
	// Authorize a client with credentials
	const auth = getAuthorization(cred);
	// Call Google Calendar API
	const googleCalendar = google.calendar({version: 'v3', auth});
	const res = await googleCalendar.calendarList.list();
	
	return res.data.items.map((calendar) => {
  	return {
  		id: calendar.id,
  		summary: calendar.summary,
  		description: calendar.description
  	}
  });
}

async function getBusyTimes(calendars = []) {
	const cred = JSON.parse(fs.readFileSync('credentials.json'));
	const auth = getAuthorization(cred);
	const googleCalendar = google.calendar({version: 'v3', auth});
	const res = await googleCalendar.freebusy.query({
		requestBody: {
		  timeMin: moment().format(),
		  timeMax: moment().add(5, 'days').format(),
		  items: calendars.map((calendar) => {
		    return { id: calendar }
			})
		}
	});

	return res.data.calendars;
}

module.exports = {
	getCalendarList,
	getBusyTimes
}