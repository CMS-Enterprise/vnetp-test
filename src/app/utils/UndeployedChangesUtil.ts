export default class UndeployedChangesUtil {
  static hasUndeployedChanges(object: any): boolean {
    // Check if version property exists and is of type number
    const hasValidVersion = typeof object?.version === 'number' && !isNaN(object.version);

    // If version property doesn't exist or isn't a valid number, return false
    if (!hasValidVersion) {
      return false;
    }

    // Check for provisionedVersion being null explicitly or being a valid number
    const isProvisionedVersionNullOrNumber =
      object?.provisionedVersion === null || (typeof object?.provisionedVersion === 'number' && !isNaN(object.provisionedVersion));

    // If provisionedVersion is not null and not a valid number, return false
    if (!isProvisionedVersionNullOrNumber) {
      return false;
    }

    // If provisionedVersion is null or version > provisionedVersion, return true
    if (object?.provisionedVersion === null || object.version > object?.provisionedVersion) {
      return true;
    }

    return false;
  }
}
