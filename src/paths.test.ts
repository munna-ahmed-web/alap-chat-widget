import { describe, expect, it } from 'vitest';

import { isPathHidden } from './paths';

describe('isPathHidden', () => {
  it('is never hidden without patterns', () => {
    expect(isPathHidden('/admin', [])).toBe(false);
  });

  it('a plain path covers itself and everything under it', () => {
    expect(isPathHidden('/admin', ['/admin'])).toBe(true);
    expect(isPathHidden('/admin/', ['/admin'])).toBe(true);
    expect(isPathHidden('/admin/users/3', ['/admin'])).toBe(true);
  });

  it('does not match a sibling that only shares the prefix', () => {
    expect(isPathHidden('/administrator', ['/admin'])).toBe(false);
    expect(isPathHidden('/shop', ['/admin'])).toBe(false);
  });

  it('treats a trailing /* like the plain path', () => {
    expect(isPathHidden('/account/orders', ['/account/*'])).toBe(true);
    expect(isPathHidden('/account', ['/account/*'])).toBe(true);
    expect(isPathHidden('/accounts', ['/account/*'])).toBe(false);
  });

  it('* matches anything in the middle or at the end of a segment', () => {
    expect(isPathHidden('/shop/42/checkout', ['/shop/*/checkout'])).toBe(true);
    expect(isPathHidden('/shop/42/cart', ['/shop/*/checkout'])).toBe(false);
    expect(isPathHidden('/checkout-step-2', ['/checkout*'])).toBe(true);
  });

  it('/ hides the home page only', () => {
    expect(isPathHidden('/', ['/'])).toBe(true);
    expect(isPathHidden('/shop', ['/'])).toBe(false);
  });

  it('escapes regex characters in a pattern', () => {
    expect(isPathHidden('/a.b/x', ['/a.b/*'])).toBe(true);
    expect(isPathHidden('/aXb/x', ['/a.b/*'])).toBe(false);
  });

  it('ignores blank entries', () => {
    expect(isPathHidden('/shop', ['', '  '])).toBe(false);
  });
});
