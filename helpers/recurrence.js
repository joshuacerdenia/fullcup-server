// @param {recurrence} can be "daily", "weekend", or "weekday".
// Returns an RRULE.
// Default time period is one week currently.
function getRecurrenceRule(recurrence) {
  const rule = [];
  
  if (recurrence === "daily") {
    rule.push('RRULE:FREQ=DAILY;INTERVAL=1;COUNT=7')
  }

  if (recurrence === "weekend") {
    rule.push('RRULE:FREQ=WEEKLY;BYDAY=SA,SU;INTERVAL=1;COUNT=2')
  }

  if (recurrence === "weekday") {
    rule.push('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;INTERVAL=1;COUNT=5')
  }

  return rule;
}

module.exports = {
  getRecurrenceRule
}