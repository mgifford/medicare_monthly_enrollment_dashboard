import { getMappableAreas, normalizeAreaName } from './geographicAreas';

describe('territory map support', () => {
  it('includes all five US territories in the national map', () => {
    const mappableNames = getMappableAreas().map((area) => area.name);

    expect(mappableNames).toEqual(
      expect.arrayContaining([
        'American Samoa',
        'Guam',
        'Northern Mariana Islands',
        'Puerto Rico',
        'Virgin Islands',
      ]),
    );
  });

  it('normalizes atlas territory names to the CMS names used by the dashboard', () => {
    expect(normalizeAreaName('United States Virgin Islands')).toBe('Virgin Islands');
    expect(normalizeAreaName('Commonwealth of the Northern Mariana Islands')).toBe(
      'Northern Mariana Islands',
    );
    expect(normalizeAreaName('Puerto Rico')).toBe('Puerto Rico');
  });
});
