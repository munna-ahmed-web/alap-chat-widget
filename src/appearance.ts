/** The widget's look, as served by the backend's public config
 * (m2o_backend integration/services/widget_appearance_service.py
 * `public_config`). Every fallback (brand colour, company name, missing
 * logo) is already resolved server-side — this only guards the shape. */
import { DEFAULT_COLOR, isHexColor } from './theme';

export type LauncherIcon = 'chat' | 'message' | 'headset' | 'sparkle' | 'image';
export type WidgetPosition = 'right' | 'left';
export type VerticalPosition = 'top' | 'middle' | 'bottom';
export type LauncherShape = 'circle' | 'rounded' | 'square';

export interface WidgetAppearance {
  primary_color: string;
  icon: LauncherIcon;
  /** Set when `icon` is 'image' (business logo or uploaded picture). */
  icon_url: string | null;
  title: string;
  greeting: string;
  position: WidgetPosition;
  /** Vertical anchor; 'middle' centres the launcher on the screen edge. */
  vertical_position: VerticalPosition;
  /** px from the side edge / the top-or-bottom edge (y is unused for 'middle'). */
  offset_x: number;
  offset_y: number;
  launcher_shape: LauncherShape;
  /** Chat window corner radius, px. */
  window_radius: number;
  hidden_paths: string[];
}

export const MAX_OFFSET_X = 300;
export const MAX_OFFSET_Y = 600;
export const MAX_WINDOW_RADIUS = 28;

export const DEFAULT_APPEARANCE: WidgetAppearance = {
  primary_color: DEFAULT_COLOR,
  icon: 'chat',
  icon_url: null,
  title: 'Chat Support',
  greeting: '',
  position: 'right',
  vertical_position: 'bottom',
  offset_x: 24,
  offset_y: 24,
  launcher_shape: 'circle',
  window_radius: 16,
  hidden_paths: [],
};

const PRESET_ICONS: readonly string[] = ['chat', 'message', 'headset', 'sparkle'];

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

/** A whole number within 0..max, else the fallback (never NaN, never huge). */
const boundedInt = (value: unknown, max: number, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(0, Math.round(value)))
    : fallback;

/** Anything the server sent, cut down to a safe, complete appearance. */
export const normalizeAppearance = (raw: unknown): WidgetAppearance => {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const iconUrl = text(data.icon_url);
  const hasImage = data.icon === 'image' && /^https?:\/\//i.test(iconUrl);
  return {
    primary_color: isHexColor(data.primary_color)
      ? data.primary_color.toLowerCase()
      : DEFAULT_APPEARANCE.primary_color,
    icon: hasImage
      ? 'image'
      : PRESET_ICONS.includes(data.icon as string)
        ? (data.icon as LauncherIcon)
        : 'chat',
    icon_url: hasImage ? iconUrl : null,
    title: text(data.title) || DEFAULT_APPEARANCE.title,
    greeting: text(data.greeting),
    position: data.position === 'left' ? 'left' : 'right',
    vertical_position:
      data.vertical_position === 'top' || data.vertical_position === 'middle'
        ? data.vertical_position
        : 'bottom',
    offset_x: boundedInt(data.offset_x, MAX_OFFSET_X, DEFAULT_APPEARANCE.offset_x),
    offset_y: boundedInt(data.offset_y, MAX_OFFSET_Y, DEFAULT_APPEARANCE.offset_y),
    launcher_shape:
      data.launcher_shape === 'rounded' || data.launcher_shape === 'square'
        ? data.launcher_shape
        : 'circle',
    window_radius: boundedInt(
      data.window_radius,
      MAX_WINDOW_RADIUS,
      DEFAULT_APPEARANCE.window_radius,
    ),
    hidden_paths: Array.isArray(data.hidden_paths)
      ? data.hidden_paths.filter((p): p is string => typeof p === 'string')
      : [],
  };
};

const API_ROOT: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://api.alapai.app';

export const configUrl = (clientId: string): string =>
  `${API_ROOT}/api/public/widget/${encodeURIComponent(clientId)}/config/`;

/**
 * The widget's appearance, or `null` when the server says this site may not
 * show it (unknown / switched-off widget, origin not on the allow-list).
 * A network or server failure is not a "no": the widget still shows, in its
 * default look, rather than vanishing from a customer's site over a blip.
 */
export const fetchAppearance = async (
  clientId: string,
): Promise<WidgetAppearance | null> => {
  try {
    const response = await fetch(configUrl(clientId), { credentials: 'omit' });
    if (response.status === 403 || response.status === 404) return null;
    if (!response.ok) return DEFAULT_APPEARANCE;
    return normalizeAppearance(await response.json());
  } catch {
    return DEFAULT_APPEARANCE;
  }
};
