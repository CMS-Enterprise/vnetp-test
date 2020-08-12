import { FilterPipe } from './filter.pipe';

describe('FilterPipe', () => {
  const pipe = new FilterPipe();

  it('should filter out items correctly', () => {
    const items = [{ count: 10 }, { count: 11 }, { count: 12 }];
    const filter = item => item.count < 11;
    const filteredItems = pipe.transform(items, filter);

    expect(filteredItems.length).toBe(1);
  });

  it('should return items when not defined', () => {
    const items = undefined;
    const filter = item => item.count < 11;
    const filteredItems = pipe.transform(items, filter);

    expect(filteredItems).toBe(undefined);
  });

  it('should return items when filter fn is not defined', () => {
    const items = [{ count: 10 }];
    const filter = undefined;
    const filteredItems = pipe.transform(items, filter);

    expect(filteredItems).toBe(items);
  });
});
