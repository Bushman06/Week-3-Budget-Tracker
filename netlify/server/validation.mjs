export function profileValues(body) {
  if (typeof body.fullName !== 'string' || !body.fullName.trim() || body.fullName.length > 100 ||
      typeof body.phone !== 'string' || body.phone.length > 40 ||
      !['KSh', 'USD', 'EUR', 'GBP'].includes(body.currency) || typeof body.hideAmounts !== 'boolean') {
    throw new Error('Enter a name (up to 100 characters), valid phone number, and currency.');
  }
  return { fullName: body.fullName.trim(), phone: body.phone.trim(), currency: body.currency, hideAmounts: body.hideAmounts };
}
export function financialValues(body) {
  if (!Number.isFinite(body.monthlyBudget) || body.monthlyBudget < 0 || !Array.isArray(body.expenses) || body.expenses.length > 10000 ||
    body.expenses.some(e => !e || !Number.isFinite(e.id) || typeof e.name !== 'string' || e.name.length > 200 || typeof e.category !== 'string' || e.category.length > 60 || !Number.isFinite(e.amount) || e.amount <= 0)) {
    throw new Error('Invalid budget or expense data.');
  }
  return { monthlyBudget: body.monthlyBudget, expenses: body.expenses.map(({ id, name, category, amount }) => ({ id, name, category, amount })) };
}
export function isJpeg(bytes) { return bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255; }
