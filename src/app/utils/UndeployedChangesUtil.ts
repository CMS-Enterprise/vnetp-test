export default class UndeployedChangesUtil {
  static hasUndeployedChanges(object: any): boolean {
    // Check if both version and provisionedVersion properties exist and are of type number
    const hasValidVersion = typeof object.version === 'number' && !isNaN(object.version);
    const hasValidProvisionedVersion = typeof object.provisionedVersion === 'number' && !isNaN(object.provisionedVersion);

    // If either property doesn't exist or isn't a valid number, return false
    if (!hasValidVersion || !hasValidProvisionedVersion) {
      return false;
    }

    // Compare version and provisionedVersion to determine if there are undeployed changes
    if (object.version > object.provisionedVersion) {
      return true;
    }
    return false;
  }
}
