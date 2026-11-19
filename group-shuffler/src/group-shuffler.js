import { el } from './dom.js';
import { MAX_STUDENTS, formatGroups, parseLabels, shuffleGroups, swapStudents } from './group-shuffler-model.js';

const byId = name => document.getElementById('group-' + name);
const form = byId('setup');
const studentCount = byId('students');
const groupCount = byId('count');
const labelsInput = byId('labels');
const numberFields = byId('number-fields');
const labelFields = byId('label-fields');
const countField = byId('count-field');
const grid = byId('grid');
const swapHelp = byId('swap-help');
const cancel = byId('cancel');
const undo = byId('undo');
const copy = byId('copy');
const copyDialog = byId('copy-dialog');
const instructions = 'Select two students in different groups to swap them.';

let groups = [];
let selected = null;
let lastSwap = null;

const usesLabels = () => form.elements['roster-mode'].value === 'labels';
const memberLabel = member => groups[member.group][member.position];

function setError(input, message = '') {
  input.setAttribute('aria-invalid', String(Boolean(message)));
  const error = document.getElementById(input.id + '-error');
  error.textContent = message;
  error.hidden = !message;
}

function rosterSize() {
  return usesLabels() ? parseLabels(labelsInput.value).length : studentCount.valueAsNumber;
}

function updateCountLimit() {
  const size = rosterSize();
  groupCount.max = Number.isInteger(size) && size >= 2 && size <= MAX_STUDENTS ? size : MAX_STUDENTS;
}

function updateRosterMode() {
  const labels = usesLabels();
  numberFields.hidden = labels;
  labelFields.hidden = !labels;
  (labels ? labelFields : numberFields).append(countField);
  [studentCount, labelsInput, groupCount].forEach(input => setError(input));
  byId('feedback').textContent = '';
  updateCountLimit();
}

function reportSetupError(input, message) {
  setError(input, message);
  byId('feedback').textContent = 'Check the highlighted field to shuffle.';
  input.focus();
}

function renderGroups() {
  grid.replaceChildren(...groups.map((students, group) => {
    const card = el('section', undefined, 'group-card');
    const title = el('h3', `Group ${group + 1}`);
    title.id = `group-card-${group + 1}`;
    card.setAttribute('aria-labelledby', title.id);
    const list = el('ul', undefined, 'group-members');
    for (const [position, label] of students.entries()) {
      const row = el('li');
      const button = el('button', label, 'group-member');
      button.type = 'button';
      button.dataset.group = group;
      button.dataset.position = position;
      button.setAttribute('aria-label', `${label}, Group ${group + 1}`);
      button.setAttribute('aria-pressed', 'false');
      row.append(button);
      list.append(row);
    }
    card.append(title, list);
    return card;
  }));
}

function buttonFor(member) {
  return grid.querySelector(`[data-group="${member.group}"][data-position="${member.position}"]`);
}

function clearExportStatus() {
  const status = byId('export-status');
  status.hidden = true;
  status.textContent = '';
}

function clearSelection(message = instructions) {
  if (selected) buttonFor(selected).setAttribute('aria-pressed', 'false');
  selected = null;
  cancel.hidden = true;
  swapHelp.textContent = message;
}

function focusResults() {
  byId('output-title').focus();
}

form.addEventListener('change', event => {
  if (event.target.name === 'roster-mode') updateRosterMode();
});

form.addEventListener('input', event => {
  if (event.target.type === 'radio') return;
  setError(event.target);
  setError(groupCount);
  byId('feedback').textContent = '';
  updateCountLimit();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  [studentCount, labelsInput, groupCount].forEach(input => setError(input));
  const labels = usesLabels() ? parseLabels(labelsInput.value) : null;
  const size = labels?.length ?? studentCount.valueAsNumber;
  if (!Number.isInteger(size) || size < 2 || size > MAX_STUDENTS) {
    reportSetupError(labels ? labelsInput : studentCount, labels
      ? `Enter 2 to ${MAX_STUDENTS} labels, one per line.`
      : `Enter a whole number from 2 to ${MAX_STUDENTS}.`);
    return;
  }

  const count = groupCount.valueAsNumber;
  if (!Number.isInteger(count) || count < 2 || count > size) {
    reportSetupError(groupCount, size === 2
      ? 'Enter 2 groups for 2 students.'
      : `Enter a whole number from 2 to ${size}.`);
    return;
  }

  const roster = labels ?? Array.from({ length: size }, (_, index) => `Student ${index + 1}`);
  groups = shuffleGroups(roster, count);
  clearSelection();
  lastSwap = null;
  undo.hidden = true;
  clearExportStatus();
  renderGroups();

  const summary = byId('summary');
  summary.textContent = `${size} students in ${count} groups`;
  summary.hidden = false;
  byId('feedback').textContent = '';
  byId('empty').hidden = true;
  byId('swap').hidden = false;
  byId('output-actions').hidden = false;
  focusResults();
});

grid.addEventListener('click', event => {
  const button = event.target.closest('.group-member');
  if (!button) return;

  const member = { group: Number(button.dataset.group), position: Number(button.dataset.position) };
  if (!selected) {
    selected = member;
    button.setAttribute('aria-pressed', 'true');
    cancel.hidden = false;
    swapHelp.textContent = `${memberLabel(member)} selected. Choose a student in another group.`;
    return;
  }
  if (selected.group === member.group) {
    if (selected.position === member.position) clearSelection();
    else swapHelp.textContent = 'Choose a student in a different group to make the swap.';
    return;
  }

  const first = selected;
  const message = `${memberLabel(first)} and ${memberLabel(member)} swapped groups.`;
  groups = swapStudents(groups, first, member);
  lastSwap = [first, member];
  clearSelection(message);
  clearExportStatus();
  undo.hidden = false;
  renderGroups();
  buttonFor(first).focus();
});

cancel.addEventListener('click', () => {
  const button = buttonFor(selected);
  clearSelection();
  button.focus();
});

undo.addEventListener('click', () => {
  const [first, second] = lastSwap;
  groups = swapStudents(groups, first, second);
  lastSwap = null;
  clearSelection('Swap undone. Select two students in different groups to swap them.');
  clearExportStatus();
  undo.hidden = true;
  renderGroups();
  buttonFor(first).focus();
});

copy.addEventListener('click', async () => {
  const text = formatGroups(groups);
  clearExportStatus();
  try {
    await navigator.clipboard.writeText(text);
    const status = byId('export-status');
    status.hidden = false;
    status.textContent = 'Groups copied.';
  } catch {
    const copyText = byId('copy-text');
    copyText.value = text;
    if (!copyDialog.open) copyDialog.showModal();
    copyText.select();
  }
});

byId('print').addEventListener('click', () => window.print());
updateRosterMode();
byId('workspace').hidden = false;
