# A Node.js algorithm for a hypothetical appointment booking service

Sometimes, you just want to put in a date, and within milliseconds, be able to query a database filled with thousands of service providers to see who has an opening for the next 7 days because phone calls are major (and time-consuming!) sources of anxiety (just a little thing I made for fun trying to replicate real-world conditions as closely as I could).

Assumptions:

1. Providers enter their opening hours and booked hours.

2. This leads to two types of events in the DB - "openings" and "appointments"

3. The number of hours marked available (openings) on any given day is not previously known.

4. This means that openings can be of any length of hours, for example, `9:30am-6:00pm` or `9:00am-11:30am`. 

5. Providers also update the system with their appointments. These are 30-minute blocks, for example, `9:30am-10:00am`.

6. The goal is to return openings (essentially potential appointments) of 30-minute blocks in a full workday that may have 0 or more appointments already scattered throughout it. 

7. The data in the database will consist of "opening" and "appointment" events in a random order of days and hours, but returned data should be sorted in ascending order by days and hours.

8. Openings can be marked as "weekly_recurring" which means that they only exist once in the database but the algorithm is expected to account for these openings reoccurring every seven days.

9. The returned data should list openings for a given day, in chronological order, for the next 7 days.

10. The query should be optimized for performance and work well on large datasets.

# Running it

- `npm install`
- `npm test --watchAll`

or just go into src and look at the code





