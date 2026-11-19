import { el } from './dom.js';
import {
  MAX_STUDENTS, formatGroups, moveStudent, parseLabels, shuffleGroups, swapStudents,
} from './group-shuffler-model.js';

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
const instructions = 'Select a student to move or swap.';
const selectedInstructions = 'Choose Move here in another group, or select another student to swap.';

let groups = [];
let selected = null;
let lastEdit = null;

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
    const heading = el('div', undefined, 'group-card-heading');
    const move = el('button', 'Move here', 'group-move');
    move.type = 'button';
    move.dataset.moveGroup = group;
    move.setAttribute('aria-label', `Move here to Group ${group + 1}`);
    move.hidden = true;
    heading.append(title, move);
    card.append(heading);

    if (!students.length) {
      card.append(el('p', 'Empty group', 'group-empty-card'));
      return card;
    }
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
    card.append(list);
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

function updateMoveTargets() {
  for (const button of grid.querySelectorAll('[data-move-group]')) {
    button.hidden = !selected || Number(button.dataset.moveGroup) === selected.group;
  }
}

function clearSelection(message = instructions) {
  if (selected) buttonFor(selected).setAttribute('aria-pressed', 'false');
  selected = null;
  cancel.hidden = true;
  swapHelp.textContent = message;
  updateMoveTargets();
}

function applyEdit(nextGroups, destination, action, message) {
  lastEdit = { groups, member: selected, action };
  clearSelection(message);
  groups = nextGroups;
  clearExportStatus();
  undo.textContent = 'Undo ' + action;
  undo.hidden = false;
  renderGroups();
  buttonFor(destination).focus();
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
  lastEdit = null;
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
  const target = event.target.closest('[data-move-group]');
  if (target && selected) {
    const group = Number(target.dataset.moveGroup);
    if (group === selected.group) return;
    const destination = { group, position: groups[group].length };
    const message = `${memberLabel(selected)} moved to Group ${group + 1}.`;
    applyEdit(moveStudent(groups, selected, group), destination, 'move', message);
    return;
  }

  const button = event.target.closest('.group-member');
  if (!button) return;

  const member = { group: Number(button.dataset.group), position: Number(button.dataset.position) };
  if (!selected) {
    selected = member;
    button.setAttribute('aria-pressed', 'true');
    cancel.hidden = false;
    swapHelp.textContent = `${memberLabel(member)} selected. ${selectedInstructions}`;
    updateMoveTargets();
    return;
  }
  if (selected.group === member.group) {
    if (selected.position === member.position) clearSelection();
    else swapHelp.textContent = selectedInstructions;
    return;
  }

  const first = selected;
  const message = `${memberLabel(first)} and ${memberLabel(member)} swapped groups.`;
  applyEdit(swapStudents(groups, first, member), first, 'swap', message);
});

cancel.addEventListener('click', () => {
  const button = buttonFor(selected);
  clearSelection();
  button.focus();
});

undo.addEventListener('click', () => {
  const previous = lastEdit;
  lastEdit = null;
  const action = previous.action === 'move' ? 'Move' : 'Swap';
  clearSelection(`${action} undone. ${instructions}`);
  groups = previous.groups;
  clearExportStatus();
  undo.hidden = true;
  renderGroups();
  buttonFor(previous.member).focus();
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
