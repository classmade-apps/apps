import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanupPhase, nextCleanupSchedule } from '../src/cleanup-cue-model.js';

const local = (day, hour, minute = 0) => new Date(2026, 10, day, hour, minute).getTime();

test('the cleanup deadline is based on the selected local bell time', () => {
  const schedule = nextCleanupSchedule(local(19, 14, 30), '14:45', 2);
  assert.deepEqual(schedule, { cleanupAt: local(19, 14, 43), bellAt: local(19, 14, 45) });
  assert.equal(cleanupPhase(schedule, schedule.cleanupAt - 1), 'waiting');
  assert.equal(cleanupPhase(schedule, schedule.cleanupAt), 'cleanup');
  assert.equal(cleanupPhase(schedule, schedule.bellAt), 'bell');
});

test('a cue started inside the cleanup window goes straight to cleanup', () => {
  const now = local(19, 14, 44);
  assert.equal(cleanupPhase(nextCleanupSchedule(now, '14:45', 2), now), 'cleanup');
});

test('a one-time cue rejects invalid fields and elapsed bells', () => {
  const now = local(19, 14, 45);
  for (const [time, lead] of [['', 2], ['24:00', 2], ['15:00', 0], ['15:00', 2.5], ['15:00', 121], ['14:45', 2]]) {
    assert.equal(nextCleanupSchedule(now, time, lead), null);
  }
});

test('weekday repeat skips the weekend after Friday’s bell', () => {
  const expected = { cleanupAt: local(23, 9, 26), bellAt: local(23, 9, 28) };
  assert.deepEqual(nextCleanupSchedule(local(20, 10), '09:28', 2, true), expected);
  assert.deepEqual(nextCleanupSchedule(local(21, 8), '09:28', 2, true), expected);
});

test('weekday repeat keeps the local bell time after a daylight-saving weekend', () => {
  const friday = new Date(2026, 2, 6, 16).getTime();
  const monday = new Date(2026, 2, 9, 9, 28).getTime();
  assert.deepEqual(nextCleanupSchedule(friday, '09:28', 2, true), { cleanupAt: monday - 120_000, bellAt: monday });
});
