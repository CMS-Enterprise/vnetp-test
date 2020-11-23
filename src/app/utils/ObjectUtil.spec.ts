import ObjectUtil from './ObjectUtil';

describe('ObjectUtil', () => {
  describe('getObjectName', () => {
    it('should return "N/A" when the objects are null', () => {
      expect(ObjectUtil.getObjectName('1', null)).toBe('N/A');
    });

    it('should return "N/A" when the objects are empty', () => {
      expect(ObjectUtil.getObjectName('1', [])).toBe('N/A');
    });

    it('should return "N/A" when the object does not exist objects', () => {
      expect(ObjectUtil.getObjectName('1', [{ id: '2', name: 'B' }])).toBe('N/A');
    });

    it('should return an existing object name', () => {
      expect(ObjectUtil.getObjectName('1', [{ id: '1', name: 'A' }])).toBe('A');
    });

    it('should return the provided default value when the object does not exist', () => {
      expect(ObjectUtil.getObjectName('1', [], 'OOPS!')).toBe('OOPS!');
    });
  });

  describe('getObjectId', () => {
    it('should return null when objects is empty', () => {
      expect(ObjectUtil.getObjectId('1', [])).toBe(null);
    });

    it('should return null when objects is null', () => {
      expect(ObjectUtil.getObjectId('1', null)).toBe(null);
    });

    it('should return null when objects is undefined', () => {
      expect(ObjectUtil.getObjectId('1', undefined)).toBe(null);
    });

    it('should return null when the object does not exist', () => {
      expect(ObjectUtil.getObjectId('1', [{ id: '2', name: 'Test2' }])).toBe(null);
    });

    it('should return null when multiple objects match', () => {
      expect(
        ObjectUtil.getObjectId('1', [
          { id: '1', name: 'Test1' },
          { id: '1', name: 'Test-1' },
        ]),
      ).toBe(null);
    });

    it('should return a match based on id', () => {
      expect(ObjectUtil.getObjectId('1', [{ id: '1', name: 'Test1' }])).toBe('1');
    });

    it('should return a match based on name', () => {
      expect(ObjectUtil.getObjectId('Test1', [{ id: '1', name: 'Test1' }])).toBe('1');
    });
  });

  describe('deepCopy', () => {
    it('should throw an error when object is null', () => {
      const throwsError = () => ObjectUtil.deepCopy(null);
      expect(throwsError).toThrowError('Null Object.');
    });

    it('should throw an error when object is undefined', () => {
      const throwsError = () => ObjectUtil.deepCopy(undefined);
      expect(throwsError).toThrowError('Null Object.');
    });

    it('should deep copy', () => {
      const test = { name: 'Test', children: ['Test1', 'Test2'] };
      const testCopy = ObjectUtil.deepCopy(test);
      expect(test).not.toBe(testCopy);
      expect(test).toEqual(testCopy);
    });
  });

  describe('removeEmptyProps', () => {
    it('should return an object with undefined props removed', () => {
      expect(ObjectUtil.removeEmptyProps({ a: undefined })).toEqual({});
    });

    it('should return an object with null props removed', () => {
      expect(ObjectUtil.removeEmptyProps({ a: null })).toEqual({});
    });

    it('should return all object props that exist', () => {
      const object = {
        a: 1,
        b: '2',
        c: true,
        d: [],
        e: {},
        f: undefined,
        g: null,
      };
      expect(ObjectUtil.removeEmptyProps(object)).toEqual({
        a: 1,
        b: '2',
        c: true,
        d: [],
        e: {},
      });
    });
  });
});
