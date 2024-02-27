import UndeployedChangesUtil from './UndeployedChangesUtil'; // Adjust the import path as necessary

describe('UndeployedChangesUtil', () => {
  describe('hasUndeployedChanges', () => {
    it('should return false if provisionedVersion is null', () => {
      const input = { version: 1, provisionedVersion: null };
      expect(UndeployedChangesUtil.hasUndeployedChanges(input)).toBe(false);
    });

    it('should return false if provisionedVersion is undefined', () => {
      const input = { version: 1 };
      expect(UndeployedChangesUtil.hasUndeployedChanges(input)).toBe(false);
    });

    it('should return false if version is null', () => {
      const input = { version: null, provisionedVersion: 1 };
      expect(UndeployedChangesUtil.hasUndeployedChanges(input)).toBe(false);
    });

    it('should return false if version is undefined', () => {
      const input = { provisionedVersion: 1 };
      expect(UndeployedChangesUtil.hasUndeployedChanges(input)).toBe(false);
    });

    it('should return false if version or provisionedVersion is not a number', () => {
      const inputs = [
        { version: '1', provisionedVersion: 1 },
        { version: 1, provisionedVersion: '1' },
        { version: true, provisionedVersion: 1 },
        { version: 1, provisionedVersion: false },
      ];
      inputs.forEach(input => {
        expect(UndeployedChangesUtil.hasUndeployedChanges(input)).toBe(false);
      });
    });

    it('should return false if version or provisionedVersion is NaN', () => {
      const inputs = [
        { version: NaN, provisionedVersion: 1 },
        { version: 1, provisionedVersion: NaN },
      ];
      inputs.forEach(input => {
        expect(UndeployedChangesUtil.hasUndeployedChanges(input)).toBe(false);
      });
    });

    it('should return true if version is greater than provisionedVersion', () => {
      const input = { version: 2, provisionedVersion: 1 };
      expect(UndeployedChangesUtil.hasUndeployedChanges(input)).toBe(true);
    });

    it('should return false if version is less than or equal to provisionedVersion', () => {
      const inputs = [
        { version: 1, provisionedVersion: 1 },
        { version: 0, provisionedVersion: 1 },
      ];
      inputs.forEach(input => {
        expect(UndeployedChangesUtil.hasUndeployedChanges(input)).toBe(false);
      });
    });
  });
});
