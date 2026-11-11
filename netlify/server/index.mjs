import { eq } from 'drizzle-orm';
import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import { db } from '../../db/index.ts';
import { profiles } from '../../db/schema.ts';
import { profileValues, financialValues, isJpeg } from './validation.mjs';

const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
export default async function handler(request) {
  try {
    const url = new URL(request.url);
    if (!['/api/profile', '/api/photo', '/api/finances'].includes(url.pathname)) return json({ error: 'Not found.' }, 404);
    if (!['GET', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
    if (request.method !== 'GET' && request.headers.get('origin') !== url.origin) return json({ error: 'Request origin rejected.' }, 403);
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/(?:^|;\s*)nf_jwt=([^;]+)/);
    if (!match) return json({ error: 'Please sign in.' }, 401);
    // Validate the session with Identity; never trust an unverified user ID or JWT payload.
    const verified = await fetch(new URL('/.netlify/identity/user', url.origin), {
      headers: { Authorization: `Bearer ${decodeURIComponent(match[1])}` }, signal: AbortSignal.timeout(8000)
    });
    if (!verified.ok) return json({ error: 'Your session has expired. Please sign in again.' }, 401);
    const user = await verified.json();
    if (!user.id) return json({ error: 'Please sign in.' }, 401);
    const where = eq(profiles.userId, user.id);
    await db.insert(profiles).values({ userId: user.id, fullName: user.user_metadata?.full_name || '' }).onConflictDoNothing();
    const [profile] = await db.select().from(profiles).where(where);
    const photos = () => getStore({ name: 'private-profile-photos', consistency: 'strong' });

    if (url.pathname === '/api/photo') {
      if (request.method === 'GET') {
        if (!profile.photoKey) return new Response(null, { status: 404 });
        const photo = await photos().get(profile.photoKey, { type: 'arrayBuffer' });
        return new Response(photo, { status: photo ? 200 : 404, headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
      }
      if (request.method === 'DELETE') {
        await db.update(profiles).set({ photoKey: null }).where(where);
        if (profile.photoKey) await photos().delete(profile.photoKey);
        return json({ ok: true });
      }
      if (Number(request.headers.get('content-length')) > 2097152) return json({ error: 'Photo must be under 2 MB.' }, 413);
      const bytes = new Uint8Array(await request.arrayBuffer());
      if (bytes.length > 2097152 || !isJpeg(bytes)) return json({ error: 'Choose a valid JPEG photo under 2 MB.' }, 400);
      const key = `${user.id}/${randomUUID()}.jpg`;
      await photos().set(key, bytes.buffer);
      await db.update(profiles).set({ photoKey: key }).where(where);
      if (profile.photoKey) await photos().delete(profile.photoKey);
      return json({ ok: true });
    }
    if (url.pathname === '/api/finances') {
      if (request.method === 'GET') return json(profile.finances);
      if (request.method !== 'PUT') return json({ error: 'Method not allowed.' }, 405);
      const finances = financialValues(await request.json());
      await db.update(profiles).set({ finances }).where(where);
      return json({ ok: true });
    }
    if (request.method === 'DELETE') {
      await db.update(profiles).set({ fullName: '', phone: '', currency: 'KSh', photoKey: null, hideAmounts: false }).where(where);
      if (profile.photoKey) await photos().delete(profile.photoKey);
      return json({ ok: true });
    }
    if (request.method === 'PATCH') {
      const body = await request.json();
      if (typeof body.hideAmounts !== 'boolean') return json({ error: 'Choose a valid privacy preference.' }, 400);
      await db.update(profiles).set({ hideAmounts: body.hideAmounts }).where(where);
    }
    if (request.method === 'PUT') await db.update(profiles).set(profileValues(await request.json())).where(where);
    const [saved] = await db.select().from(profiles).where(where);
    const { finances, photoKey, userId, ...details } = saved;
    return json({ ...details, email: user.email, hasPhoto: Boolean(photoKey) });
  } catch (error) {
    if (error instanceof SyntaxError || /Invalid budget|Enter a name/.test(error.message)) return json({ error: error.message }, 400);
    return json({ error: 'Unable to save or load your account. Please try again.' }, 500);
  }
}
export const config = { path: '/api/*' };
