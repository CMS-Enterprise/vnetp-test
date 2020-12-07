export default class ObjectUtil {
  static getObjectName(id: string, objects: Lookup[], defaultName = 'N/A'): string {
    if (!objects || objects.length === 0) {
      return defaultName;
    }
    const object = objects.find(o => o.id === id);
    return object ? object.name : defaultName;
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

  static removeEmptyProps<T>(object: T): T {
    const copy = ObjectUtil.deepCopy(object);
    return Object.entries(copy).reduce((newObject, [key, value]) => {
      if (value === undefined || value === null) {
        return newObject;
      }
      return Object.assign(newObject, { [key]: value });
    }, {} as T);
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
