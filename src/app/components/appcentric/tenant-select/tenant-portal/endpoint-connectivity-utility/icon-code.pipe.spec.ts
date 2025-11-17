import { IconCodePipe } from './icon-code.pipe';

describe('IconCodePipe', () => {
  let pipe: IconCodePipe;

  beforeEach(() => {
    pipe = new IconCodePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return correct icon code for "building"', () => {
    expect(pipe.transform('building')).toBe('\uf1ad');
  });

  it('should return correct icon code for "object-group"', () => {
    expect(pipe.transform('object-group')).toBe('\uf247');
  });

  it('should return correct icon code for "layer-group"', () => {
    expect(pipe.transform('layer-group')).toBe('\uf5fd');
  });

  it('should return correct icon code for "desktop"', () => {
    expect(pipe.transform('desktop')).toBe('\uf108');
  });

  it('should return correct icon code for "file-contract"', () => {
    expect(pipe.transform('file-contract')).toBe('\uf56c');
  });

  it('should return correct icon code for "book"', () => {
    expect(pipe.transform('book')).toBe('\uf02d');
  });

  it('should return correct icon code for "filter"', () => {
    expect(pipe.transform('filter')).toBe('\uf0b0');
  });

  it('should return correct icon code for "list"', () => {
    expect(pipe.transform('list')).toBe('\uf03a');
  });

  it('should return default icon code for unknown value', () => {
    expect(pipe.transform('unknown')).toBe('\uf111');
  });

  it('should return default icon code for empty string', () => {
    expect(pipe.transform('')).toBe('\uf111');
  });

  it('should return default icon code for undefined', () => {
    expect(pipe.transform(undefined as any)).toBe('\uf111');
  });
});

