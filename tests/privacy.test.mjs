import test from 'node:test';
import assert from 'node:assert/strict';
import { createAmountVisibility } from '../privacy.js';
function element(textContent = '', type = '') {
  const target = new EventTarget();
  return Object.assign(target, { textContent, type, checked: false, attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } });
}
function setup(control) {
  const classes = new Set();
  const root = { classList: { toggle(name, value) { if (value) classes.add(name); else classes.delete(name); } } };
  const amounts = ['KSh 720.00', 'KSh 1,000.00', 'KSh 280.00'].map(value => element(value));
  const changes = [];
  const visibility = createAmountVisibility({ root, amounts, controls: [control], onChange: value => changes.push(value) });
  return { visibility, amounts, changes, classes };
}
test('dashboard button hides all three totals, then restores their exact values', () => {
  const button = element();
  const { amounts, changes } = setup(button);
  button.dispatchEvent(new Event('click'));
  assert.deepEqual(amounts.map(item => item.textContent), ['••••', '••••', '••••']);
  assert.equal(button.textContent, 'Show amounts');
  assert.equal(button.attributes['aria-pressed'], 'true');
  button.dispatchEvent(new Event('click'));
  assert.deepEqual(amounts.map(item => item.textContent), ['KSh 720.00', 'KSh 1,000.00', 'KSh 280.00']);
  assert.equal(button.textContent, 'Hide amounts');
  assert.deepEqual(changes, [true, false]);
});
test('settings switch applies both directions immediately without an account', () => {
  const checkbox = element('', 'checkbox');
  const { visibility, classes, changes } = setup(checkbox);
  checkbox.checked = true; checkbox.dispatchEvent(new Event('change'));
  assert.equal(visibility.isHidden(), true);
  assert.equal(classes.has('amounts-private'), true);
  checkbox.checked = false; checkbox.dispatchEvent(new Event('change'));
  assert.equal(visibility.isHidden(), false);
  assert.equal(classes.has('amounts-private'), false);
  assert.deepEqual(changes, [true, false]);
});
test('budget updates remain masked and restore the latest amount when revealed', () => {
  const button = element();
  const { visibility, amounts } = setup(button);
  visibility.setHidden(true);
  visibility.setAmount(amounts[0], 'KSh 640.00');
  assert.equal(amounts[0].textContent, '••••');
  button.dispatchEvent(new Event('click'));
  assert.equal(amounts[0].textContent, 'KSh 640.00');
});
