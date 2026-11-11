/** Turns the owner's one brand colour into the widget's CSS variables. */

export const DEFAULT_COLOR = '#3b82f6';

const DARK_TEXT = '#111827';
const LIGHT_TEXT = '#ffffff';

export const isHexColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

const channels = (hex: string): number[] =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** `hex` moved `amount` (0–1) of the way towards `target`. */
export const mix = (hex: string, target: string, amount: number): string => {
  const to = channels(target);
  return `#${channels(hex)
    .map((c, i) => Math.round(c + (to[i] - c) * amount))
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`;
};

const luminance = (hex: string): number => {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Text colour on `hex`: whichever of white / near-black contrasts more.
 * Same maths as the dashboard preview (message2order WidgetCard/appearance.ts
 * `readableOn`) so the live widget matches what the owner was shown. */
export const readableOn = (hex: string): string => {
  if (!isHexColor(hex)) return LIGHT_TEXT;
  const l = luminance(hex);
  const onWhite = 1.05 / (l + 0.05);
  const onDark = (l + 0.05) / (luminance(DARK_TEXT) + 0.05);
  return onWhite >= onDark ? LIGHT_TEXT : DARK_TEXT;
};

export const themeVars = (color: unknown): Record<string, string> => {
  const base = isHexColor(color) ? color.toLowerCase() : DEFAULT_COLOR;
  return {
    '--primary-color': base,
    '--primary-hover': mix(base, '#000000', 0.15),
    '--on-primary': readableOn(base),
    '--primary-soft': mix(base, '#ffffff', 0.9),
    '--primary-soft-border': mix(base, '#ffffff', 0.7),
  };
};

/** Inline on the shadow host, which outranks the stylesheet's `:host`. */
export const applyTheme = (host: HTMLElement, color: unknown): void => {
  Object.entries(themeVars(color)).forEach(([name, value]) =>
    host.style.setProperty(name, value),
  );
};
