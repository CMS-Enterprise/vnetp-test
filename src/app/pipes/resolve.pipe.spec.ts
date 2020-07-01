import { ResolvePipe } from './resolve.pipe';

describe('ResolvePipe', () => {
  const pipe = new ResolvePipe();

  it('should resolve data from a callback', () => {
    const item = { count: 10 };
    // tslint:disable-next-line: no-shadowed-variable
    const callback = item => item.count;
    const resolvedItem = pipe.transform(item, callback);

    expect(resolvedItem).toBe(10);
  });

  it('should return item when not defined', () => {
    const item = undefined;
    // tslint:disable-next-line: no-shadowed-variable
    const callback = item => item.count;
    const resolvedItem = pipe.transform(item, callback);

    expect(resolvedItem).toBe(undefined);
  });

  it('should return item when callback fn is not defined', () => {
    const item = { count: 10 };
    const callback = undefined;
    const resolvedItem = pipe.transform(item, callback);

    expect(resolvedItem).toBe(item);
  });
});
