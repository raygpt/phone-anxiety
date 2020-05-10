import knex from 'knexClient';
import getAvailabilities from './getAvailabilities';

describe('getAvailabilities', () => {
  beforeEach(() => knex('events').truncate());

  describe('simple case', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:30'),
          ends_at: new Date('2014-08-04 12:30'),
          weekly_recurring: true
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 10:30'),
          ends_at: new Date('2014-08-11 11:30')
        }
      ]);
    });

    it('should fetch availabilities correctly', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10'));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date('2014-08-10'))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2014-08-11'))
      );
      expect(availabilities[1].slots).toEqual([
        '9:30',
        '10:00',
        '11:30',
        '12:00'
      ]);

      expect(availabilities[2].slots).toEqual([]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2014-08-16'))
      );
    });
  });

  describe('Empty schedule as input', () => {
    it('should fetch an array of length 7, and all inner slot arrays should be empty', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10'));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date('2014-08-10'))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2014-08-11'))
      );
      expect(availabilities[1].slots).toEqual([]);

      expect(String(availabilities[2].date)).toBe(
        String(new Date('2014-08-12'))
      );
      expect(availabilities[2].slots).toEqual([]);

      expect(String(availabilities[3].date)).toBe(
        String(new Date('2014-08-13'))
      );
      expect(availabilities[3].slots).toEqual([]);

      expect(String(availabilities[4].date)).toBe(
        String(new Date('2014-08-14'))
      );
      expect(availabilities[4].slots).toEqual([]);

      expect(String(availabilities[5].date)).toBe(
        String(new Date('2014-08-15'))
      );
      expect(availabilities[5].slots).toEqual([]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2014-08-16'))
      );
      expect(availabilities[6].slots).toEqual([]);
    });
  });

  describe('Random, unsorted input with overlapping events', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'appointment',
          starts_at: new Date('2018-09-01 9:30'),
          ends_at: new Date('2018-09-01 10:00')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2018-09-01 10:30'),
          ends_at: new Date('2018-09-01 11:00')
        },
        {
          kind: 'opening',
          starts_at: new Date('2018-09-03 10:30'),
          ends_at: new Date('2018-09-03 15:30')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2018-09-03 11:00'),
          ends_at: new Date('2018-09-03 11:30')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2018-08-31 13:00'),
          ends_at: new Date('2018-08-31 13:30')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2018-09-03 15:00'),
          ends_at: new Date('2018-09-03 15:30')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2018-08-31 14:00'),
          ends_at: new Date('2018-08-31 14:30')
        },
        {
          kind: 'opening',
          starts_at: new Date('2018-09-01 09:30'),
          ends_at: new Date('2018-09-01 18:30'),
          weekly_recurring: true
        },
        {
          kind: 'opening',
          starts_at: new Date('2018-08-31 9:30'),
          ends_at: new Date('2018-08-31 15:00')
        }
      ]);
    });

    it('should return an array of length 7 even if the dates are shared between August and September', async () => {
      const availabilities = await getAvailabilities(new Date('2018-08-30'));
      expect(availabilities.length).toBe(7);
    });

    it('should ensure slots are correct and the final slot in the array is 30 minutes before closing time', async () => {
      const availabilities = await getAvailabilities(new Date('2018-08-30'));
      expect(availabilities[1].date).toEqual(new Date('2018-08-31'));
      expect(availabilities[1].slots).toEqual([
        '9:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:30',
        '14:30'
      ]);
    });
  });

  describe('Input where all openings are overlapped by appointments', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-11 09:30'),
          ends_at: new Date('2014-08-11 11:30'),
          weekly_recurring: true
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 9:30'),
          ends_at: new Date('2014-08-11 10:00')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 10:00'),
          ends_at: new Date('2014-08-11 10:30')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 10:30'),
          ends_at: new Date('2014-08-11 11:00')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 11:00'),
          ends_at: new Date('2014-08-11 11:30')
        }
      ]);
    });

    it('should return empty slots array for 2014-08-11', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10'));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2014-08-11'))
      );
      expect(availabilities[1].slots).toEqual([]);
    });
  });

  describe('Input where no openings are overlapped by appointments', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-11 09:30'),
          ends_at: new Date('2014-08-11 11:30')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-12 9:30'),
          ends_at: new Date('2014-08-12 10:00')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-12 10:00'),
          ends_at: new Date('2014-08-12 10:30')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-12 10:30'),
          ends_at: new Date('2014-08-12 11:00')
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-12 11:00'),
          ends_at: new Date('2014-08-12 11:30')
        }
      ]);
    });

    it('should return open slots only for 2014-08-11', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10'));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date('2014-08-10'))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2014-08-11'))
      );
      expect(availabilities[1].slots).toEqual([
        '9:30',
        '10:00',
        '10:30',
        '11:00'
      ]);
    });
  });

  describe('Input where events straddle across years', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-12-31 09:30'),
          ends_at: new Date('2014-12-31 11:30'),
          weekly_recurring: true
        },
        {
          kind: 'appointment',
          starts_at: new Date('2015-01-01 9:30'),
          ends_at: new Date('2015-01-01 10:00')
        },
        {
          kind: 'opening',
          starts_at: new Date('2015-01-01 9:00'),
          ends_at: new Date('2015-01-01 10:30')
        }
      ]);
    });

    it('should return open slots for 2015-01-01', async () => {
      const availabilities = await getAvailabilities(new Date('2014-12-31'));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2015-01-01'))
      );
      expect(availabilities[1].slots).toEqual(['9:00', '10:00']);
    });

    it('should return weekly recurring open slots for 2015-01-06', async () => {
      const availabilities = await getAvailabilities(new Date('2014-12-31'));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2015-01-06'))
      );
      expect(availabilities[1].slots).toEqual(['9:00', '10:00']);
    });
  });
});
