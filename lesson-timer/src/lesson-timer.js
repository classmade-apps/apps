import { LessonTimer, isActivityDuration, isActivityName, isLessonPlan, maxActivities, starterPlan } from './lesson-timer-model.js';
import { formatTime } from './timer-model.js';
import { createTimerChime } from './timer-chime.js';

const byId = name => document.getElementById('lesson-' + name);
const workspace = byId('workspace');
const stage = byId('stage');
const presentation = byId('presentation');
const form = byId('plan');
const fields = byId('fields');
const list = byId('activities');
const template = byId('row');
const start = byId('start');
const pause = byId('pause');
const skip = byId('skip');
const reset = byId('reset');
const add = byId('add');
const fullscreen = byId('fullscreen');
const soundTone = byId('sound-tone');
const soundPreview = byId('sound-preview');
const soundStatus = byId('sound-status');
const chime = createTimerChime();
const storageKey = 'classmade-lesson-plan';
const soundKey = 'classmade-lesson-sound';

function loadPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (isLessonPlan(saved)) return saved;
  } catch {
    // The starter plan also works when storage is unavailable.
  }
  return starterPlan;
}

let timer = new LessonTimer(loadPlan());
let interval;
let lastAnnouncement;

function renderRows(plan) {
  list.replaceChildren(...plan.map((activity, index) => {
    const row = template.content.firstElementChild.cloneNode(true);
    const step = 'Activity ' + (index + 1);
    row.querySelector('.lesson-step').textContent = index + 1;
    const name = row.querySelector('[data-field="name"]');
    name.value = activity.name;
    name.setAttribute('aria-label', step + ' name');
    row.querySelector('.lesson-sr').textContent = step + ' duration in minutes';
    const minutes = row.querySelector('[data-field="minutes"]');
    minutes.value = Number.isFinite(activity.minutes) ? activity.minutes : '';
    for (const input of [name, minutes]) {
      const field = input.dataset.field;
      const error = row.querySelector(`[data-error="${field}"]`);
      error.id = `lesson-activity-${index + 1}-${field}-error`;
      input.setAttribute('aria-describedby', error.id);
    }
    const up = row.querySelector('[data-action="up"]');
    const down = row.querySelector('[data-action="down"]');
    const remove = row.querySelector('[data-action="remove"]');
    up.setAttribute('aria-label', 'Move ' + step.toLowerCase() + ' up');
    down.setAttribute('aria-label', 'Move ' + step.toLowerCase() + ' down');
    remove.setAttribute('aria-label', 'Remove ' + step.toLowerCase());
    up.disabled = index === 0;
    down.disabled = index === plan.length - 1;
    remove.disabled = plan.length === 1;
    return row;
  }));
  add.disabled = plan.length >= maxActivities;
  updatePlan();
}

function readPlan() {
  return Array.from(list.children, row => ({
    name: row.querySelector('[data-field="name"]').value,
    minutes: row.querySelector('[data-field="minutes"]').valueAsNumber,
  }));
}

function showFieldError(row, field, message) {
  const input = row.querySelector(`[data-field="${field}"]`);
  const error = row.querySelector(`[data-error="${field}"]`);
  input.setAttribute('aria-invalid', String(Boolean(message)));
  if (error.textContent !== message) error.textContent = message;
  error.hidden = !message;
}

function updatePlan() {
  const plan = readPlan();
  const valid = isLessonPlan(plan);
  let invalidRows = 0;
  plan.forEach((activity, index) => {
    const row = list.children[index];
    const nameError = isActivityName(activity.name) ? '' : 'Enter an activity name (up to 70 characters).';
    const duration = row.querySelector('[data-field="minutes"]');
    const durationError = isActivityDuration(activity.minutes) ? '' : duration.validity.valueMissing && !duration.validity.badInput
      ? 'Enter the duration in minutes.'
      : 'Enter a whole number from 1 to 180 minutes.';
    showFieldError(row, 'name', nameError);
    showFieldError(row, 'minutes', durationError);
    const invalid = Boolean(nameError || durationError);
    row.toggleAttribute('data-invalid', invalid);
    row.querySelector('.lesson-row-errors').hidden = !invalid;
    invalidRows += Number(invalid);
  });
  const summary = invalidRows === 1 ? '1 activity needs attention' : `${invalidRows} activities need attention`;
  byId('validation').hidden = valid;
  byId('validation-title').textContent = valid ? '' : summary;
  const planStatus = byId('plan-status');
  const message = valid ? '' : summary + '. Fix the highlighted fields to start the lesson.';
  if (planStatus.textContent !== message) planStatus.textContent = message;
  planStatus.classList.toggle('lesson-sr', !valid);
  byId('total').textContent = valid ? plan.reduce((sum, activity) => sum + activity.minutes, 0) + ' min total' : '';
  fullscreen.disabled = !valid;
  start.toggleAttribute('data-invalid', !valid);
  start.textContent = valid ? 'Start lesson' : 'Fix lesson plan';
  if (valid) {
    timer = new LessonTimer(plan.map(activity => ({ ...activity, name: activity.name.trim() })));
    try {
      localStorage.setItem(storageKey, JSON.stringify(timer.plan));
    } catch {
      byId('plan-hint').textContent = 'Browser storage is unavailable. Keep this tab open to use your edits.';
    }
  }
  renderStage();
  return valid;
}

function renderStage() {
  const ready = timer.phase === 'ready';
  const complete = timer.phase === 'complete';
  const active = document.activeElement;
  const position = complete ? '' : `Activity ${timer.index + 1} of ${timer.plan.length}`;
  const state = {
    ready: start.hasAttribute('data-invalid') ? 'Setup incomplete' : 'Ready',
    paused: 'Paused',
    running: '',
    complete: 'Finished',
  }[timer.phase];
  byId('position').textContent = [position, state].filter(Boolean).join(' · ');
  byId('activity').textContent = timer.current?.name ?? '';
  byId('clock').textContent = formatTime(timer.remaining);
  byId('progress').value = timer.duration ? timer.remaining / timer.duration : 0;
  byId('current').hidden = complete;
  byId('complete').hidden = !complete;
  byId('next').hidden = complete;
  byId('next-name').textContent = timer.next?.name ?? 'End of lesson';
  byId('next-time').textContent = timer.next ? timer.next.minutes + ' min' : '';
  start.hidden = !ready;
  pause.hidden = ready || complete;
  pause.textContent = timer.phase === 'paused' ? 'Resume' : 'Pause';
  skip.hidden = ready || complete;
  reset.hidden = ready;
  fields.disabled = !ready;
  if (!ready) byId('plan-status').textContent = 'Reset the lesson to edit the plan.';

  if (active === start && start.hidden) pause.focus();
  if (complete && (active === pause || active === skip)) reset.focus();
  if (ready && active === reset) start.focus();

  const announcement = complete ? 'Lesson complete.' : `${position}. ${timer.current.name}. ${state}`.trim();
  if (!ready && announcement !== lastAnnouncement) byId('status').textContent = announcement;
  lastAnnouncement = ready ? '' : announcement;
}

function stopClock() {
  clearInterval(interval);
  interval = undefined;
}

function showSoundError() {
  soundStatus.textContent = 'Sound could not play on this device.';
}

function announceTransition(previousIndex) {
  if (timer.current && timer.index !== previousIndex && soundTone.value !== 'off') {
    void chime.play(soundTone.value).catch(showSoundError);
  }
}

function tick() {
  const index = timer.index;
  timer.tick(Date.now());
  if (timer.index !== index) {
    renderStage();
    announceTransition(index);
  } else {
    const time = formatTime(timer.remaining);
    if (byId('clock').textContent !== time) byId('clock').textContent = time;
    byId('progress').value = timer.remaining / timer.duration;
  }
  if (timer.phase === 'complete') stopClock();
}

function startClock() {
  timer.start(Date.now());
  if (soundTone.value !== 'off') void chime.prepare().catch(showSoundError);
  renderStage();
  interval = setInterval(tick, 200);
}

fields.addEventListener('input', () => updatePlan());
form.addEventListener('submit', event => {
  event.preventDefault();
  if (timer.phase !== 'ready') return;
  if (updatePlan()) startClock();
  else list.querySelector('[aria-invalid="true"]')?.focus();
});

pause.addEventListener('click', () => {
  if (timer.phase === 'paused') {
    startClock();
    return;
  }
  const index = timer.index;
  timer.pause(Date.now());
  stopClock();
  renderStage();
  announceTransition(index);
});

skip.addEventListener('click', () => {
  const index = timer.index;
  timer.skip(Date.now());
  if (timer.phase === 'complete') stopClock();
  renderStage();
  announceTransition(index);
});

reset.addEventListener('click', () => {
  stopClock();
  timer = new LessonTimer(timer.plan);
  byId('plan-status').textContent = '';
  byId('status').textContent = 'Lesson reset.';
  renderStage();
});

list.addEventListener('click', event => {
  const action = event.target.closest('button')?.dataset.action;
  if (!action) return;

  const index = Array.from(list.children).indexOf(event.target.closest('li'));
  const plan = readPlan();
  let destination = index + (action === 'up' ? -1 : 1);
  if (action === 'remove') {
    plan.splice(index, 1);
    destination = Math.min(index, plan.length - 1);
  } else {
    [plan[index], plan[destination]] = [plan[destination], plan[index]];
  }
  renderRows(plan);
  const row = list.children[destination];
  const movedButton = row.querySelector(`[data-action="${action}"]`);
  const focus = action !== 'remove' && !movedButton.disabled ? movedButton : row.querySelector('[data-field="name"]');
  focus.focus();
});

add.addEventListener('click', () => {
  const plan = readPlan();
  plan.push({ name: '', minutes: 5 });
  renderRows(plan);
  list.lastElementChild.querySelector('[data-field="name"]').focus();
});

fullscreen.addEventListener('click', async () => {
  if (presentation.open) {
    presentation.close();
    return;
  }
  if (document.fullscreenElement === stage) {
    await document.exitFullscreen();
    return;
  }
  try {
    if (document.fullscreenEnabled) {
      await stage.requestFullscreen();
      return;
    }
  } catch {
    // The display can still fill the viewport if the browser denies fullscreen.
  }
  presentation.append(stage);
  fullscreen.textContent = 'Exit fullscreen';
  presentation.showModal();
  fullscreen.focus();
});

presentation.addEventListener('close', () => {
  workspace.prepend(stage);
  fullscreen.textContent = 'Fullscreen';
  fullscreen.focus();
});

document.addEventListener('fullscreenchange', () => {
  fullscreen.textContent = document.fullscreenElement === stage ? 'Exit fullscreen' : 'Fullscreen';
});

document.addEventListener('visibilitychange', () => {
  if (timer.phase === 'running') tick();
});

soundTone.addEventListener('change', () => {
  soundPreview.disabled = soundTone.value === 'off';
  soundStatus.textContent = '';
  if (soundTone.value !== 'off') void chime.prepare().catch(showSoundError);
  try {
    localStorage.setItem(soundKey, soundTone.value);
  } catch {
    // The sound selection still applies to the current tab.
  }
});

soundPreview.addEventListener('click', () => {
  soundStatus.textContent = '';
  void chime.play(soundTone.value).catch(showSoundError);
});

try {
  const savedTone = localStorage.getItem(soundKey);
  if (savedTone === 'gentle' || savedTone === 'bright') {
    soundTone.value = savedTone;
    soundPreview.disabled = false;
  }
} catch {
  // Leave the sound off when browser storage is unavailable.
}

renderRows(timer.plan);
workspace.hidden = false;
