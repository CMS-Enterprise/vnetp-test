import ObjectUtil from './object.util';

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
});
