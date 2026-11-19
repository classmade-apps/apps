export const MAX_CLEANUP_MINUTES = 120;

export function isBellTime(value) {
  return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isCleanupLead(minutes) {
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= MAX_CLEANUP_MINUTES;
}

export function nextCleanupSchedule(now, time, minutesEarly, weekdays = false) {
  if (!isBellTime(time) || !isCleanupLead(minutesEarly)) return null;

  const [hours, minutes] = time.split(':').map(Number);
  const day = new Date(now);
  // Advance through local calendar dates so the bell keeps its wall-clock time.
  day.setHours(12, 0, 0, 0);
  const daysToCheck = weekdays ? 8 : 1;
  for (let offset = 0; offset < daysToCheck; offset++) {
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    if (!weekdays || !weekend) {
      const bell = new Date(day);
      bell.setHours(hours, minutes, 0, 0);
      if (bell.getHours() === hours && bell.getMinutes() === minutes && bell.getTime() > now) {
        return { bellAt: bell.getTime(), cleanupAt: bell.getTime() - minutesEarly * 60_000 };
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return null;
}

export function cleanupPhase(schedule, now) {
  if (now >= schedule.bellAt) return 'bell';
  return now >= schedule.cleanupAt ? 'cleanup' : 'waiting';
}
