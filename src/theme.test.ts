import { describe, expect, it } from 'vitest';

import { DEFAULT_COLOR, isHexColor, mix, readableOn, themeVars } from './theme';

describe('isHexColor', () => {
  it('accepts only #rrggbb', () => {
    expect(isHexColor('#1D4ed8')).toBe(true);
    expect(isHexColor('#fff')).toBe(false);
    expect(isHexColor('red')).toBe(false);
    expect(isHexColor(null)).toBe(false);
  });
});

describe('mix', () => {
  it('moves a colour towards the target', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mix('#336699', '#ffffff', 0)).toBe('#336699');
    expect(mix('#336699', '#000000', 1)).toBe('#000000');
  });
});

describe('readableOn', () => {
  it('white on dark colours, near-black on light ones', () => {
    expect(readableOn('#1d4ed8')).toBe('#ffffff');
    expect(readableOn('#facc15')).toBe('#111827');
  });
});

describe('themeVars', () => {
  it('derives every variable from the brand colour', () => {
    const vars = themeVars('#1D4ED8');
    expect(vars['--primary-color']).toBe('#1d4ed8');
    expect(vars['--on-primary']).toBe('#ffffff');
    expect(vars['--primary-hover']).toBe(mix('#1d4ed8', '#000000', 0.15));
    expect(vars['--primary-soft']).toBe(mix('#1d4ed8', '#ffffff', 0.9));
  });

  it('falls back to the default for anything that is not a hex colour', () => {
    expect(themeVars('javascript:alert(1)')['--primary-color']).toBe(DEFAULT_COLOR);
    expect(themeVars(undefined)['--primary-color']).toBe(DEFAULT_COLOR);
  });
});
