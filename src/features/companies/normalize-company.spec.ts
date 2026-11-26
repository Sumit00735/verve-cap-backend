import { normalizeCompanyName, normalizeIdentifier } from './normalize-company';

describe('normalizeCompanyName', () => {
  it('lowercases and collapses spaces', () => {
    expect(normalizeCompanyName('  Acme   Corp. ')).toBe('acme corp');
  });
});

describe('normalizeIdentifier', () => {
  it('uppercases trimmed values', () => {
    expect(normalizeIdentifier(' in123 ')).toBe('IN123');
  });
});
