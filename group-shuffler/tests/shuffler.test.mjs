import assert from 'node:assert/strict';
import test from 'node:test';
import { formatGroups, moveStudent, parseLabels, shuffleGroups, swapStudents } from '../src/group-shuffler-model.js';

test('roster parsing trims lines and preserves repeated names as distinct entries', () => {
  assert.deepEqual(parseLabels(' Sam \r\n\r\nMorgan\n Sam \rRiley '), ['Sam', 'Morgan', 'Sam', 'Riley']);
});

test('shuffle assigns every entry to a balanced group without changing the input', () => {
  const roster = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const groups = shuffleGroups(roster, 3, () => 0);
  assert.deepEqual(groups, [['B', 'C', 'D'], ['E', 'F'], ['G', 'A']]);
  assert.deepEqual(roster, ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  assert.throws(() => shuffleGroups(roster, 8), RangeError);
});

test('swapping updates only the two selected positions and can be undone', () => {
  const groups = [['A', 'B'], ['C', 'D'], ['E']];
  const first = { group: 0, position: 1 };
  const second = { group: 2, position: 0 };
  const swapped = swapStudents(groups, first, second);
  assert.deepEqual(swapped, [['A', 'E'], ['C', 'D'], ['B']]);
  assert.deepEqual(swapStudents(swapped, first, second), groups);
  assert.equal(formatGroups(swapped), 'Group 1\n- A\n- E\n\nGroup 2\n- C\n- D\n\nGroup 3\n- B');
});

test('moving one student to a smaller group keeps all other assignments intact', () => {
  const groups = [['A', 'B', 'C', 'D'], ['E', 'F', 'G'], ['H', 'I', 'J']];
  const moved = moveStudent(groups, { group: 0, position: 2 }, 1);
  assert.deepEqual(moved, [['A', 'B', 'D'], ['E', 'F', 'G', 'C'], ['H', 'I', 'J']]);
  assert.deepEqual(groups, [['A', 'B', 'C', 'D'], ['E', 'F', 'G'], ['H', 'I', 'J']]);
});

test('empty groups stay available as a destination and appear in exports', () => {
  const moved = moveStudent([['A'], ['B']], { group: 0, position: 0 }, 1);
  assert.equal(formatGroups(moved), 'Group 1\nEmpty group\n\nGroup 2\n- B\n- A');
  assert.deepEqual(moveStudent(moved, { group: 1, position: 1 }, 0), [['A'], ['B']]);
});
