import { SortPipe } from './sort.pipe';

describe('SortPipe', () => {
  const pipe = new SortPipe();

  // it('should return values when passed in is not defined', () => {
  //   expect(pipe.transform(null, 'prop')).toBe(null);
  //   expect(pipe.transform(undefined, 'prop')).toBe(undefined);
  // });

  it('should values when prop is not defined', () => {
    expect(pipe.transform([], '')).toEqual([]);
    expect(pipe.transform([], undefined)).toEqual([]);
    expect(pipe.transform([], null)).toEqual([]);
  });

  it('should sort a single value', () => {
    expect(pipe.transform([{ prop: 1 }], 'prop')).toEqual([{ prop: 1 }]);
  });

  it('should sort number props', () => {
    const values = [{ prop: 2 }, { prop: 1 }];

    expect(pipe.transform(values, 'prop')).toEqual([{ prop: 1 }, { prop: 2 }]);
  });

  it('should sort string props', () => {
    const values = [{ prop: 'B' }, { prop: 'A' }];

    expect(pipe.transform(values, 'prop')).toEqual([{ prop: 'A' }, { prop: 'B' }]);
  });
});
