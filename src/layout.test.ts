import { describe, expect, it } from 'vitest';

import { DEFAULT_APPEARANCE } from './appearance';
import { layoutClasses, layoutVars } from './layout';

describe('layout', () => {
  it('the default appearance reproduces the long-standing bottom-right look', () => {
    expect(layoutClasses(DEFAULT_APPEARANCE)).toBe('pos-right v-bottom');
    expect(layoutVars(DEFAULT_APPEARANCE)).toEqual({
      '--alapai-x': '24px',
      '--alapai-y': '24px',
      '--alapai-launcher-radius': '50%',
      '--alapai-window-radius': '16px',
    });
  });

  it('turns the owner choices into classes and CSS variables', () => {
    const custom = {
      ...DEFAULT_APPEARANCE,
      position: 'left' as const,
      vertical_position: 'top' as const,
      offset_x: 8,
      offset_y: 90,
      launcher_shape: 'rounded' as const,
      window_radius: 0,
    };
    expect(layoutClasses(custom)).toBe('pos-left v-top');
    expect(layoutVars(custom)).toEqual({
      '--alapai-x': '8px',
      '--alapai-y': '90px',
      '--alapai-launcher-radius': '18px',
      '--alapai-window-radius': '0px',
    });
  });
});
