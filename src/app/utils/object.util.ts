export default class ObjectUtil {
  static getObjectName(id: string, objects: Lookup[]): string {
    if (!objects || objects.length === 0) {
      return 'N/A';
    }
    const object = objects.find(o => o.id === id);
    return object ? object.name : 'N/A';
  }
}

export interface Lookup {
  id?: string;
  name: string;
}
