import { initAccount, renderAuth, api, signOut, showPhoto } from './account.js';
import { createAmountVisibility, linkAmountVisibility } from './privacy.js';
const $ = id => document.getElementById(id);
const theme = $('darkMode');
theme.checked = document.documentElement.dataset.theme === 'dark';
theme.onchange = () => {
  document.documentElement.dataset.theme = theme.checked ? 'dark' : 'light';
  localStorage.setItem('spendwiseTheme', document.documentElement.dataset.theme);
  $('themeMessage').textContent = 'Appearance updated on this device.';
};
let profile;
let privacySaveQueue = Promise.resolve();
const visibility = createAmountVisibility({
  root: document.documentElement,
  controls: [$('hideAmounts')],
  onChange(hidden) {
    linkAmountVisibility(hidden, document);
    const message = $('privacyMessage');
    message.classList.remove('error');
    message.textContent = hidden ? 'Financial amounts are hidden on your dashboard.' : 'Financial amounts are visible on your dashboard.';
    if (!profile) {
      message.textContent += ' Sign in to save this preference to your account.';
      return;
    }
    privacySaveQueue = privacySaveQueue.then(async () => {
      const saved = await api('profile', { method: 'PATCH', body: JSON.stringify({ hideAmounts: hidden }) });
      profile.hideAmounts = saved.hideAmounts;
    }).catch(() => {
      message.classList.add('error');
      message.textContent = 'Display updated. Unable to save your preference; try the switch again.';
    });
  }
});
visibility.setHidden(new URLSearchParams(location.search).get('hideAmounts') === 'true');
linkAmountVisibility(visibility.isHidden(), document);
function requireProfile() {
  if (profile) return true;
  $('profileMessage').textContent = 'Sign in above to save your personal information or change your photo.';
  $('loginEmail')?.focus();
  return false;
}
function fill() {
  $('fullName').value = profile.fullName; $('email').value = profile.email;
  $('phone').value = profile.phone; $('currency').value = profile.currency;
  visibility.setHidden(profile.hideAmounts);
  linkAmountVisibility(profile.hideAmounts, document);
  showPhoto(profile, $('profilePhoto'), $('profileInitial'));
}
async function perform(messageId, action) {
  const message = $(messageId); message.classList.remove('error'); message.textContent = 'Saving…';
  try { await action(); message.textContent = 'Changes saved.'; }
  catch (error) { message.classList.add('error'); message.textContent = error.message; }
}
async function start() {
  try {
    // Preserve callbacks for password/invite forms on either landing page.
    const callbackHash = /invite_token|recovery_token/.test(location.hash);
    const user = await initAccount();
    if (!user) {
      $('accountStatus').textContent = 'Sign in to save your profile and budget privately across devices.';
      if (!callbackHash) await renderAuth($('authPanel'));
      return;
    }
    $('signOut').hidden = false;
    $('accountStatus').textContent = `Signed in as ${user.email || 'your account'}`;
    profile = await api('profile'); fill();
    $('profileFields').disabled = false; $('hideAmounts').disabled = false; $('clearProfile').disabled = false;
  } catch (error) { $('accountStatus').textContent = error.message || 'Unable to load your account. Please reload to try again.'; }
}
$('signOut').onclick = () => perform('profileMessage', signOut);
$('profileForm').onsubmit = event => {
  event.preventDefault();
  if (!requireProfile()) return;
  const button = event.submitter; button.disabled = true;
  perform('profileMessage', async () => {
    profile = await api('profile', { method: 'PUT', body: JSON.stringify({ fullName: $('fullName').value.trim(), phone: $('phone').value.trim(), currency: $('currency').value, hideAmounts: $('hideAmounts').checked }) }); fill();
  }).finally(() => { button.disabled = false; });
};
$('photoInput').onchange = () => perform('profileMessage', async () => {
  if (!profile) { $('photoInput').value = ''; throw new Error('Sign in above to save a profile photo.'); }
  const file = $('photoInput').files[0]; if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG or WebP photo under 5 MB.');
  $('photoInput').disabled = true;
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 384;
    const context = canvas.getContext('2d'); context.fillStyle = '#ffffff'; context.fillRect(0, 0, 384, 384);
    const side = Math.min(bitmap.width, bitmap.height);
    context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 384, 384); bitmap.close();
    const jpeg = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .86));
    if (!jpeg) throw new Error('Unable to read this photo. Choose another image.');
    await api('photo', { method: 'PUT', body: jpeg, headers: { 'Content-Type': 'image/jpeg' } });
    profile.hasPhoto = true; showPhoto(profile, $('profilePhoto'), $('profileInitial'));
  } finally { $('photoInput').disabled = false; $('photoInput').value = ''; }
});
$('removePhoto').onclick = () => perform('profileMessage', async () => {
  if (!profile) throw new Error('Sign in above to change your profile photo.');
  await api('photo', { method: 'DELETE' }); profile.hasPhoto = false; showPhoto(profile, $('profilePhoto'), $('profileInitial'));
});
$('clearProfile').onclick = () => {
  if (!confirm('Clear your saved name, phone, photo and profile preferences? Your sign-in account and budget records remain.')) return;
  perform('profileMessage', async () => {
    await api('profile', { method: 'DELETE' }); profile = await api('profile'); fill();
    // Remove legacy device-only details so they cannot reappear for another person.
    localStorage.removeItem('spendwiseProfile');
  });
};
start();
