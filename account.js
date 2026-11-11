import { getUser, getSettings, login, logout, signup, handleAuthCallback, updateUser, acceptInvite, requestPasswordRecovery, oauthLogin } from '@netlify/identity';
export async function api(path, options = {}) {
  const response = await fetch(`/api/${path}`, { ...options, credentials: 'same-origin', headers: { ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Unable to complete the request. Please try again.');
  }
  return response.json();
}
export async function initAccount() {
  if (!document.getElementById('authPanel') && /invite_token|recovery_token/.test(location.hash)) {
    location.replace(`/setting.html${location.hash}`);
    return null;
  }
  const result = await handleAuthCallback();
  if (result?.type === 'invite' || result?.type === 'recovery') {
    // Keep callback tokens in memory only; never put them in a URL or browser storage.
    showPasswordForm(result);
    return null;
  }
  return getUser();
}
function showPasswordForm(result) {
  let host = document.getElementById('authPanel');
  if (!host) {
    location.replace(`/setting.html${location.hash}`);
    return;
  }
  host.hidden = false;
  host.innerHTML = `<form class="auth-form" id="newPasswordForm"><h3>Choose your password</h3><div class="form-group"><label for="newPassword">New password</label><input id="newPassword" type="password" minlength="10" required autocomplete="new-password"></div><button class="primary-btn">Save password</button><p class="message" role="status"></p></form>`;
  host.querySelector('form').onsubmit = async event => {
    event.preventDefault();
    const button = host.querySelector('button'); button.disabled = true;
    try {
      const password = host.querySelector('input').value;
      if (result.type === 'invite') await acceptInvite(result.token, password);
      else await updateUser({ password });
      location.replace('/setting.html');
    } catch { host.querySelector('.message').textContent = 'Unable to set your password. Request a new link and try again.'; button.disabled = false; }
  };
}
export async function renderAuth(host) {
  host.hidden = false;
  let settings;
  try { settings = await getSettings(); }
  catch { host.textContent = 'Sign-in is currently unavailable. Please try again later.'; return; }
  let signupMode = false;
  host.innerHTML = `<form class="auth-form"><div class="form-group" id="signupNameGroup" hidden><label for="signupName">Your name</label><input id="signupName" maxlength="100" autocomplete="name"></div><div class="form-group"><label for="loginEmail">Email address</label><input id="loginEmail" type="email" autocomplete="username" required></div><div class="form-group"><label for="loginPassword">Password</label><input id="loginPassword" type="password" autocomplete="current-password" required></div><div class="auth-actions"><button class="primary-btn" id="authSubmit">Sign in</button><button class="secondary-btn" type="button" id="authMode">Create account</button><button class="secondary-btn" type="button" id="forgotPassword">Forgot password</button></div><p id="authMessage" class="message" role="status"></p></form><div class="auth-actions" id="providers"></div>`;
  const form = host.querySelector('form'), message = host.querySelector('#authMessage');
  host.querySelector('#authMode').hidden = settings.disableSignup || !settings.providers.email;
  if (!settings.providers.email) { form.hidden = true; }
  host.querySelector('#authMode').onclick = () => {
    signupMode = !signupMode;
    host.querySelector('#signupNameGroup').hidden = !signupMode;
    host.querySelector('#signupName').required = signupMode;
    host.querySelector('#authSubmit').textContent = signupMode ? 'Create account' : 'Sign in';
    host.querySelector('#authMode').textContent = signupMode ? 'Use existing account' : 'Create account';
    const password = host.querySelector('#loginPassword'); password.minLength = signupMode ? 10 : 1; password.autocomplete = signupMode ? 'new-password' : 'current-password';
    message.textContent = '';
  };
  form.onsubmit = async event => {
    event.preventDefault();
    const button = host.querySelector('#authSubmit'); button.disabled = true;
    message.textContent = signupMode ? 'Creating your account…' : 'Signing in…';
    try {
      const email = host.querySelector('#loginEmail').value.trim(), password = host.querySelector('#loginPassword').value;
      if (signupMode) {
        await signup(email, password, { full_name: host.querySelector('#signupName').value.trim() });
        if (!settings.autoconfirm) { message.textContent = 'Check your email to confirm your account, then sign in.'; host.querySelector('#loginPassword').value = ''; return; }
      } else await login(email, password);
      location.reload();
    } catch { message.textContent = signupMode ? 'Unable to create your account. Check your details or try signing in.' : 'Unable to sign in. Check your email, password, and email confirmation.'; }
    finally { button.disabled = false; }
  };
  host.querySelector('#forgotPassword').onclick = async () => {
    const email = host.querySelector('#loginEmail'); if (!email.reportValidity()) return;
    try { await requestPasswordRecovery(email.value.trim()); message.textContent = 'If an account exists, check your email for a password reset link.'; }
    catch { message.textContent = 'Unable to send a reset link. Please try again.'; }
  };
  for (const provider of ['google', 'github', 'gitlab', 'bitbucket', 'facebook']) {
    if (!settings.providers[provider]) continue;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary-btn'; button.textContent = `Continue with ${provider}`; button.onclick = () => oauthLogin(provider); host.querySelector('#providers').append(button);
  }
  if (!settings.providers.email && !host.querySelector('#providers').children.length) host.textContent = 'No sign-in methods are currently available.';
}
export async function signOut() { await logout(); location.reload(); }
export function showPhoto(profile, image, initial) {
  initial.textContent = (profile.fullName || 'U').slice(0, 1).toUpperCase();
  image.hidden = true; initial.hidden = false;
  if (profile.hasPhoto) {
    image.onload = () => { image.hidden = false; initial.hidden = true; };
    image.onerror = () => { image.hidden = true; initial.hidden = false; };
    image.src = `/api/photo?v=${Date.now()}`;
  } else image.removeAttribute('src');
}
