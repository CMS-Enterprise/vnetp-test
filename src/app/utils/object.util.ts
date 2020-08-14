export default class ObjectUtil {
  static getObjectName(id: string, objects: Lookup[]): string {
    if (!objects || objects.length === 0) {
      return 'N/A';
    }
    const object = objects.find(o => o.id === id);
    return object ? object.name : 'N/A';
  }

  static getObjectId(nameOrId: string, objects: Lookup[]): string {
    if (!objects || objects.length === 0) {
      return null;
    }

    const filteredObjects = objects.filter(o => o.name === nameOrId || o.id === nameOrId);
    if (filteredObjects.length === 1) {
      return filteredObjects[0].id;
    }
    return null;
  }

  static deepCopy<T>(object: T): T {
    if (!object) {
      throw new Error('Null Object.');
    }
    return JSON.parse(JSON.stringify(object));
  }
}

export interface Lookup {
  id?: string;
  name: string;
}
