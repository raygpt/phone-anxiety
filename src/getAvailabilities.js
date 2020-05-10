import moment from 'moment';
import knex from 'knexClient';

const getScheduleEvents = date =>
  knex
    .select('kind', 'starts_at', 'ends_at', 'weekly_recurring')
    .from('events')
    .orderBy('starts_at', 'asc')
    .where('weekly_recurring', true)
    .orWhere('ends_at', '>', +date);

// push hours to array in increments of 30 minutes
const getEventHours = event => {
  const date = moment(event.starts_at).subtract(30, 'minutes');
  const hours = [];
  while (date.add(30, 'minutes').isBefore(event.ends_at)) {
    hours.push(date.format('H:mm'));
  }

  return hours;
};

const mapEventsToDays = async date => {
  const events = await getScheduleEvents(date);
  const eventDays = events.reduce((eventAccumulator, event) => {
    const eventDate = moment(event.starts_at);
    const eventHours = getEventHours(event);
    const eventDates = [eventDate.format('YYYY-MM-DD')];

    // make sure we remember the open slots for a weekly recurring event
    if (event.weekly_recurring) {
      eventDates.push(eventDate.add(1, 'week').format('YYYY-MM-DD'));
    }

    // nested reduce allows us to map each events object to its correct date
    const eventsOnDates = eventDates.reduce((dayAccumulator, date) => {
      const eventsOnDate = eventAccumulator[date] || {};
      return {
        [date]: {
          ...eventsOnDate,
          [event.kind]: eventsOnDate[event.kind]
            ? [...eventsOnDate[event.kind], ...eventHours]
            : eventHours
        }
      };
    }, {});

    return {
      ...eventAccumulator,
      ...eventsOnDates
    };
  }, {});

  return eventDays;
};

// subtract the appointment hours from the opening hours to get the available hours
const filterOutAppointments = (eventDays, availabilities) => {
  for (const day in eventDays) {
    if (availabilities.has(day)) {
      const availableDay = availabilities.get(day);
      const opening = eventDays[day].opening || [];
      const appointment = eventDays[day].appointment || [];
      availableDay.slots = opening.filter(
        hour => appointment.indexOf(hour) === -1
      );
    }
  }
  return Array.from(availabilities.values());
};

// set up the 7-element skeleton array that we'll fill
const generateScheduleFromDate = date => {
  const availabilities = new Map();

  const dateIncrementor = moment(date);
  for (let i = 0; i < 7; i++) {
    availabilities.set(dateIncrementor.format('YYYY-MM-DD'), {
      date: dateIncrementor.toDate(),
      slots: []
    });
    dateIncrementor.add(1, 'days');
  }

  return availabilities;
};

export default async function getAvailabilities(queryDate) {
  const schedule = generateScheduleFromDate(queryDate);

  const eventDays = await mapEventsToDays(queryDate);

  return filterOutAppointments(eventDays, schedule);
}
