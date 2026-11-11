import test from 'node:test';
import assert from 'node:assert/strict';
import { profileValues, financialValues, isJpeg } from '../netlify/server/validation.mjs';
test('profile updates whitelist fields and reject invalid preferences', () => {
  assert.deepEqual(profileValues({ fullName: ' Amina ', phone: '', currency: 'KSh', hideAmounts: true, userId: 'another-user', photoKey: 'private' }), { fullName: 'Amina', phone: '', currency: 'KSh', hideAmounts: true });
  assert.throws(() => profileValues({ fullName: ' ', phone: '', currency: 'KSh', hideAmounts: false }));
  assert.throws(() => profileValues({ fullName: 'Amina', phone: '', currency: 'invalid', hideAmounts: 'false' }));
});
test('budget updates reject invalid values and discard unrelated fields', () => {
  assert.deepEqual(financialValues({ monthlyBudget: 300, expenses: [{ id: 1, name: 'Lunch', category: 'Food', amount: 20, userId: 'other' }] }), { monthlyBudget: 300, expenses: [{ id: 1, name: 'Lunch', category: 'Food', amount: 20 }] });
  assert.throws(() => financialValues({ monthlyBudget: -1, expenses: [] }));
  assert.throws(() => financialValues({ monthlyBudget: 100, expenses: [{ id: 1, name: 'Lunch', category: 'Food', amount: Infinity }] }));
});
test('photo signature rejects scripts and non-JPEG files', () => {
  assert.equal(isJpeg(new TextEncoder().encode('<svg onload="alert(1)">')), false);
  assert.equal(isJpeg(new Uint8Array([255, 216, 255, 224])), true);
});
