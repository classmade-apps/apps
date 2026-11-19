export const maxActivities = 20;

export const starterPlan = [
  { name: 'Bell ringer', minutes: 5 },
  { name: 'Partner work', minutes: 10 },
  { name: 'Direct instruction', minutes: 20 },
  { name: 'Exit ticket', minutes: 5 },
  { name: 'Homework', minutes: 5 },
];

export function isActivityName(name) {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 70;
}

export function isActivityDuration(minutes) {
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 180;
}

export function isLessonPlan(plan) {
  return Array.isArray(plan) && plan.length >= 1 && plan.length <= maxActivities &&
    plan.every(activity => activity && isActivityName(activity.name) && isActivityDuration(activity.minutes));
}

export function isClassName(name) {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 50;
}

export function restoreClassPlans(saved, legacy) {
  const classes = saved?.classes;
  if (Array.isArray(classes) && classes.length &&
      classes.every(entry => isClassName(entry?.name) && isLessonPlan(entry.activities))) {
    const selected = Number.isInteger(saved.selected) && classes[saved.selected] ? saved.selected : 0;
    return { classes, selected };
  }
  return {
    classes: [{ name: 'My class', activities: isLessonPlan(legacy) ? legacy : starterPlan }],
    selected: 0,
  };
}

export class LessonTimer {
  constructor(plan) {
    if (!isLessonPlan(plan)) throw new RangeError('Enter a name and 1 to 180 minutes for every activity.');
    this.plan = plan;
    this.index = 0;
    this.phase = 'ready';
    this.deadline = null;
    this.remaining = this.duration;
  }

  get current() { return this.plan[this.index]; }
  get next() { return this.plan[this.index + 1]; }
  get duration() { return (this.current?.minutes ?? 0) * 60_000; }

  start(now) {
    if (this.phase !== 'ready' && this.phase !== 'paused') return;
    this.deadline = now + this.remaining;
    this.phase = 'running';
  }

  advance(from) {
    this.index++;
    this.remaining = this.duration;
    if (!this.current) this.phase = 'complete';
    this.deadline = this.phase === 'running' ? from + this.remaining : null;
  }

  tick(now) {
    if (this.phase !== 'running') return;
    while (this.phase === 'running' && now >= this.deadline) {
      this.advance(this.deadline);
    }
    if (this.phase === 'running') this.remaining = this.deadline - now;
  }

  pause(now) {
    this.tick(now);
    if (this.phase !== 'running') return;
    this.phase = 'paused';
    this.deadline = null;
  }

  skip(now) {
    // If a natural transition just happened, keep the newly started activity.
    const index = this.index;
    this.tick(now);
    if (this.index === index && (this.phase === 'running' || this.phase === 'paused')) {
      this.advance(now);
    }
  }
}
