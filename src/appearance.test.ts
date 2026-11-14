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
        vertical_position: 'top',
        offset_x: 40,
        offset_y: 120,
        launcher_shape: 'rounded',
        window_radius: 4,
        hidden_paths: ['/admin', '/account/*'],
      }),
    ).toEqual({
      primary_color: '#16a34a',
      icon: 'headset',
      icon_url: null,
      title: 'Dhaka Market',
      greeting: 'Hi!',
      position: 'left',
      vertical_position: 'top',
      offset_x: 40,
      offset_y: 120,
      launcher_shape: 'rounded',
      window_radius: 4,
      hidden_paths: ['/admin', '/account/*'],
    });
  });

  it('keeps the old look for a config from before placement and shape existed', () => {
    const old = normalizeAppearance({ title: 'Shop', position: 'right' });
    expect(old.vertical_position).toBe('bottom');
    expect([old.offset_x, old.offset_y]).toEqual([24, 24]);
    expect(old.launcher_shape).toBe('circle');
    expect(old.window_radius).toBe(16);
  });

  it('clamps offsets and radius and ignores junk', () => {
    const wild = normalizeAppearance({
      vertical_position: 'left',
      offset_x: 99999,
      offset_y: -5,
      launcher_shape: 'star',
      window_radius: 'big',
    });
    expect(wild.vertical_position).toBe('bottom');
    expect(wild.offset_x).toBe(300);
    expect(wild.offset_y).toBe(0);
    expect(wild.launcher_shape).toBe('circle');
    expect(wild.window_radius).toBe(16);
    expect(normalizeAppearance({ window_radius: 99 }).window_radius).toBe(28);
    expect(normalizeAppearance({ offset_x: NaN }).offset_x).toBe(24);
    expect(normalizeAppearance({ offset_x: 10.6 }).offset_x).toBe(11);
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
