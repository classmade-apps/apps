import assert from 'node:assert/strict';
import test from 'node:test';
import { LessonTimer, isLessonPlan, starterPlan } from '../src/lesson-timer-model.js';

const minute = 60_000;

test('one start advances through the 45-minute plan even when ticks are delayed', () => {
  const timer = new LessonTimer(starterPlan);
  timer.start(0);

  timer.tick(5 * minute);
  assert.equal(timer.current.name, 'Partner work');
  assert.equal(timer.next.name, 'Direct instruction');
  assert.equal(timer.remaining, 10 * minute);

  timer.tick(37 * minute);
  assert.equal(timer.current.name, 'Exit ticket');
  assert.equal(timer.remaining, 3 * minute);

  timer.tick(45 * minute);
  assert.equal(timer.phase, 'complete');
  assert.equal(timer.remaining, 0);
  assert.equal(timer.deadline, null);
});

test('pause freezes time, resume keeps the remaining time, and skip works in either phase', () => {
  const timer = new LessonTimer(starterPlan);
  timer.start(0);
  timer.pause(2 * minute);
  timer.tick(6 * minute);
  assert.equal(timer.remaining, 3 * minute);

  timer.start(6 * minute);
  timer.tick(9 * minute);
  assert.equal(timer.current.name, 'Partner work');

  timer.skip(10 * minute);
  assert.equal(timer.phase, 'running');
  assert.equal(timer.current.name, 'Direct instruction');
  assert.equal(timer.deadline, 30 * minute);

  timer.pause(11 * minute);
  timer.skip(12 * minute);
  assert.equal(timer.phase, 'paused');
  assert.equal(timer.current.name, 'Exit ticket');
  assert.equal(timer.remaining, 5 * minute);

  timer.skip(13 * minute);
  timer.skip(13 * minute);
  assert.equal(timer.phase, 'complete');
});

test('stored plans require at least one labeled activity with a whole-minute duration', () => {
  assert.equal(isLessonPlan([]), false);
  assert.equal(isLessonPlan([{ name: ' ', minutes: 1 }]), false);
  assert.equal(isLessonPlan([{ name: 'X'.repeat(71), minutes: 1 }]), false);
  assert.equal(isLessonPlan([{ name: 'Read' }]), false);
  assert.equal(isLessonPlan([{ name: 'Read', minutes: NaN }]), false);
  assert.equal(isLessonPlan([{ name: 'Read', minutes: '5' }]), false);
  assert.equal(isLessonPlan([{ name: 'Read', minutes: 0 }]), false);
  assert.equal(isLessonPlan([{ name: 'Read', minutes: 1.5 }]), false);
  assert.equal(isLessonPlan([{ name: 'Read', minutes: 181 }]), false);
  assert.equal(isLessonPlan([{ name: 'Read', minutes: 1 }]), true);
  assert.equal(isLessonPlan([{ name: 'Read', minutes: 180 }]), true);
});
