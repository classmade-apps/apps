export const MAX_STUDENTS = 200;

export function parseLabels(text) {
  return text.split(/\r\n?|\n/).map(label => label.trim()).filter(Boolean);
}

export function shuffleGroups(labels, count, random = Math.random) {
  if (labels.length < 2 || labels.length > MAX_STUDENTS || !Number.isInteger(count) || count < 2 || count > labels.length) {
    throw new RangeError('Choose at least two groups and at least one student per group.');
  }

  const shuffled = [...labels];
  for (let end = shuffled.length - 1; end > 0; end--) {
    const pick = Math.floor(random() * (end + 1));
    [shuffled[end], shuffled[pick]] = [shuffled[pick], shuffled[end]];
  }
  const size = Math.floor(shuffled.length / count);
  const extra = shuffled.length % count;
  let start = 0;
  return Array.from({ length: count }, (_, index) => {
    const end = start + size + Number(index < extra);
    const group = shuffled.slice(start, end);
    start = end;
    return group;
  });
}

export function swapStudents(groups, first, second) {
  const swapped = groups.map(group => [...group]);
  const firstGroup = swapped[first.group];
  const secondGroup = swapped[second.group];
  [firstGroup[first.position], secondGroup[second.position]] = [secondGroup[second.position], firstGroup[first.position]];
  return swapped;
}

export function moveStudent(groups, student, destination) {
  const moved = groups.map(group => [...group]);
  const [label] = moved[student.group].splice(student.position, 1);
  moved[destination].push(label);
  return moved;
}

export function formatGroups(groups) {
  return groups.map((students, index) => {
    const members = students.length ? students.map(label => `- ${label}`) : ['Empty group'];
    return [`Group ${index + 1}`, ...members].join('\n');
  }).join('\n\n');
}
