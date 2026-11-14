import type { CSSProperties } from 'react';
import type { WidgetAppearance } from './appearance';

/** Launcher corner radius per shape — the dashboard preview uses the same. */
export const LAUNCHER_RADIUS: Record<WidgetAppearance['launcher_shape'], string> = {
  circle: '50%',
  rounded: '18px',
  square: '6px',
};

/** Where the widget sits and how round it is, as CSS variables the stylesheet
 * reads (position classes pick the anchor; these supply the distances). */
export const layoutVars = (a: WidgetAppearance): CSSProperties =>
  ({
    '--alapai-x': `${a.offset_x}px`,
    '--alapai-y': `${a.offset_y}px`,
    '--alapai-launcher-radius': LAUNCHER_RADIUS[a.launcher_shape],
    '--alapai-window-radius': `${a.window_radius}px`,
  }) as CSSProperties;

/** Container classes for the horizontal side and vertical anchor. */
export const layoutClasses = (a: WidgetAppearance): string =>
  `pos-${a.position} v-${a.vertical_position}`;
