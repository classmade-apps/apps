import { formatTime } from './timer-model.js';
import { createCleanupSound } from './cleanup-cue-sound.js';
import { MAX_CLEANUP_MINUTES, cleanupPhase, isBellTime, isCleanupLead, nextCleanupSchedule } from './cleanup-cue-model.js';

const byId = name => document.getElementById('cleanup-' + name);
const workspace = byId('workspace');
const form = byId('settings');
const fields = byId('fields');
const bellInput = byId('bell');
const leadInput = byId('lead');
const repeatInput = byId('repeat');
const toneInput = byId('tone');
const preview = byId('preview');
const stage = byId('stage');
const displayTitle = byId('display-title');
const clock = byId('clock');
const stop = byId('stop');
const fullscreen = byId('fullscreen');
const presentation = byId('presentation');
const sound = createCleanupSound();
const storageKey = 'classmade-cleanup-cue';
const bellHold = 60_000;
const timeLabel = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dayLabel = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

let active = null;
let interval;

function readSettings() {
  return { time: bellInput.value, lead: leadInput.valueAsNumber, weekdays: repeatInput.checked, tone: toneInput.value };
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (isBellTime(saved?.time)) bellInput.value = saved.time;
    if (isCleanupLead(saved?.lead)) leadInput.value = saved.lead;
    if (typeof saved?.weekdays === 'boolean') repeatInput.checked = saved.weekdays;
    if (['bell', 'bright', 'off'].includes(saved?.tone)) toneInput.value = saved.tone;
  } catch {
    // The cue also works when browser storage is unavailable.
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Keep the schedule for this tab.
  }
}

function setError(input, message = '') {
  input.setAttribute('aria-invalid', String(Boolean(message)));
  const error = document.getElementById(input.id + '-error');
  error.textContent = message;
  error.hidden = !message;
}

function momentLabel(at, now) {
  const date = new Date(at);
  const time = timeLabel.format(date);
  return date.toDateString() === new Date(now).toDateString() ? time : `${dayLabel.format(date)}, ${time}`;
}

function renderTimeline(schedule, now) {
  byId('timeline').hidden = !schedule;
  if (!schedule) return;
  byId('at').textContent = momentLabel(schedule.cleanupAt, now);
  byId('bell-at').textContent = momentLabel(schedule.bellAt, now);
}

function renderPreview(message = 'Ready to set up') {
  const { time, lead, weekdays } = readSettings();
  const now = Date.now();
  const schedule = nextCleanupSchedule(now, time, lead, weekdays);
  stage.dataset.phase = 'ready';
  byId('state').textContent = message;
  displayTitle.textContent = 'Cleanup starts in';
  byId('display-note').textContent = schedule ? 'Start the cue to begin the countdown.' : 'Set an upcoming bell time to see when cleanup starts.';
  clock.textContent = '–:––';
  clock.setAttribute('aria-label', 'Time until cleanup');
  fields.disabled = false;
  stop.hidden = true;
  preview.disabled = toneInput.value === 'off';
  renderTimeline(schedule, now);
}

function formatCountdown(remaining) {
  const seconds = Math.ceil(Math.max(0, remaining) / 1000);
  if (seconds < 3600) return formatTime(remaining);
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(hours / 24);
  const time = `${hours % 24}:${formatTime((seconds % 3600) * 1000)}`;
  return days ? `${days}d ${time}` : time;
}

function renderPhase(phase) {
  stage.dataset.phase = phase;
  const content = {
    waiting: ['Cue running', 'Cleanup starts in', 'Keep working until the cue.'],
    cleanup: ['Cleanup started', 'Time to clean up', 'Time until the bell'],
    bell: ['Countdown finished', 'Bell time', ''],
  };
  const [state, title, note] = content[phase];
  byId('state').textContent = state;
  displayTitle.textContent = title;
  byId('display-note').textContent = note;
  clock.setAttribute('aria-label', phase === 'waiting' ? 'Time until cleanup' : 'Time until the bell');
  byId('announcement').textContent = phase === 'waiting' ? '' : title;
  stop.textContent = phase === 'bell' && !active.settings.weekdays ? 'Edit cue' : 'Stop cue';
}

function soundFailed(run) {
  if (active === run) byId('stage-message').textContent = 'The sound could not play. The screen will still show the cleanup cue.';
}

function stopClock() {
  clearInterval(interval);
  interval = undefined;
}

function tick() {
  if (!active) return;
  const now = Date.now();
  const { settings } = active;
  if (settings.weekdays && now >= active.schedule.bellAt + bellHold) {
    const next = nextCleanupSchedule(now, settings.time, settings.lead, true);
    if (next) {
      active.schedule = next;
      active.played = false;
      renderTimeline(next, now);
    }
  }

  const phase = cleanupPhase(active.schedule, now);
  if (stage.dataset.phase !== phase) renderPhase(phase);
  const deadline = phase === 'waiting' ? active.schedule.cleanupAt : active.schedule.bellAt;
  const time = formatCountdown(deadline - now);
  if (clock.textContent !== time) clock.textContent = time;

  if (phase === 'cleanup' && !active.played) {
    active.played = true;
    const run = active;
    if (settings.tone !== 'off') void sound.play(settings.tone).catch(() => soundFailed(run));
  }
  if (phase === 'bell' && !settings.weekdays) stopClock();
}

form.addEventListener('input', event => {
  if (active) return;
  if (event.target === bellInput || event.target === leadInput) setError(event.target);
  if (event.target === repeatInput) setError(bellInput);
  if (event.target === toneInput) sound.stop();
  byId('form-status').textContent = '';
  byId('preview-status').textContent = '';
  renderPreview();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (active) return;

  const settings = readSettings();
  const now = Date.now();
  const schedule = nextCleanupSchedule(now, settings.time, settings.lead, settings.weekdays);
  const leadError = isCleanupLead(settings.lead) ? '' : `Enter 1 to ${MAX_CLEANUP_MINUTES} whole minutes.`;
  let bellError = '';
  if (!isBellTime(settings.time)) bellError = 'Enter a bell time.';
  else if (!leadError && !schedule) bellError = 'Choose an upcoming bell time today, or turn on weekday repeat.';

  setError(bellInput, bellError);
  setError(leadInput, leadError);
  if (bellError || leadError) {
    byId('form-status').textContent = 'Check the highlighted field to start the cue.';
    (bellError ? bellInput : leadInput).focus();
    return;
  }

  const run = { schedule, settings, played: false };
  active = run;
  sound.stop();
  saveSettings(settings);
  if (settings.tone !== 'off') void sound.prepare().catch(() => soundFailed(run));
  fields.disabled = true;
  stop.hidden = false;
  byId('form-status').textContent = '';
  byId('stage-message').textContent = '';
  renderTimeline(schedule, now);
  interval = setInterval(tick, 200);
  tick();
  displayTitle.focus();
});

stop.addEventListener('click', () => {
  stopClock();
  sound.stop();
  active = null;
  byId('stage-message').textContent = '';
  byId('announcement').textContent = 'Cue stopped.';
  renderPreview('Cue stopped');
  (document.fullscreenElement === stage || presentation.open ? fullscreen : bellInput).focus();
});

preview.addEventListener('click', () => {
  const status = byId('preview-status');
  status.textContent = '';
  void sound.play(toneInput.value).catch(() => {
    status.textContent = 'Sound could not play on this device.';
  });
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
    // The viewport presentation is available when the browser denies fullscreen.
  }
  presentation.append(stage);
  fullscreen.textContent = 'Exit fullscreen';
  presentation.showModal();
  fullscreen.focus();
});

presentation.addEventListener('close', () => {
  workspace.append(stage);
  fullscreen.textContent = 'Fullscreen';
  fullscreen.focus();
});

document.addEventListener('fullscreenchange', () => {
  fullscreen.textContent = document.fullscreenElement === stage || presentation.open ? 'Exit fullscreen' : 'Fullscreen';
});
document.addEventListener('visibilitychange', tick);

loadSettings();
renderPreview();
workspace.hidden = false;
