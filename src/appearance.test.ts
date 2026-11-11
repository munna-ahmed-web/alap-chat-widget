import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_APPEARANCE,
  fetchAppearance,
  normalizeAppearance,
} from './appearance';

describe('normalizeAppearance', () => {
  it('keeps a well-formed config', () => {
    expect(
      normalizeAppearance({
        primary_color: '#16A34A',
        icon: 'headset',
        icon_url: null,
        title: 'Dhaka Market',
        greeting: 'Hi!',
        position: 'left',
        hidden_paths: ['/admin', '/account/*'],
      }),
    ).toEqual({
      primary_color: '#16a34a',
      icon: 'headset',
      icon_url: null,
      title: 'Dhaka Market',
      greeting: 'Hi!',
      position: 'left',
      hidden_paths: ['/admin', '/account/*'],
    });
  });

  it('fills every gap with the defaults', () => {
    expect(normalizeAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(normalizeAppearance({ primary_color: 'blue', position: 'top' })).toEqual(
      DEFAULT_APPEARANCE,
    );
  });

  it('keeps a picture launcher only with a usable url', () => {
    const picture = normalizeAppearance({
      icon: 'image',
      icon_url: 'https://cdn.example.com/logo.png',
    });
    expect(picture.icon).toBe('image');
    expect(picture.icon_url).toBe('https://cdn.example.com/logo.png');

    const broken = normalizeAppearance({ icon: 'image', icon_url: 'javascript:1' });
    expect(broken.icon).toBe('chat');
    expect(broken.icon_url).toBeNull();
  });

  it('drops hidden paths that are not strings', () => {
    expect(normalizeAppearance({ hidden_paths: ['/a', 3, null] }).hidden_paths).toEqual([
      '/a',
    ]);
  });
});

describe('fetchAppearance', () => {
  afterEach(() => vi.unstubAllGlobals());

  const respond = (status: number, body: unknown = {}) =>
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status,
        ok: status >= 200 && status < 300,
        json: () => Promise.resolve(body),
      }),
    );

  it('asks the public config endpoint for this widget', async () => {
    respond(200, { title: 'Shop', position: 'left' });
    const appearance = await fetchAppearance('abc-123');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.alapai.app/api/public/widget/abc-123/config/',
      { credentials: 'omit' },
    );
    expect(appearance?.title).toBe('Shop');
    expect(appearance?.position).toBe('left');
  });

  it('returns null when the site is not allowed or the widget is off', async () => {
    respond(403);
    expect(await fetchAppearance('k')).toBeNull();
    respond(404);
    expect(await fetchAppearance('k')).toBeNull();
  });

  it('falls back to the default look on a server or network failure', async () => {
    respond(500);
    expect(await fetchAppearance('k')).toEqual(DEFAULT_APPEARANCE);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await fetchAppearance('k')).toEqual(DEFAULT_APPEARANCE);
  });
});
