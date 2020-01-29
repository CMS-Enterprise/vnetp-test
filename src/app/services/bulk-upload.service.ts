import { Injectable } from '@angular/core';

/**
 * Service for bulk uploading.
 */
@Injectable({
  providedIn: 'root',
})
export class BulkUploadService {
  constructor() {}

  getObjectId(name, array) {
    const serviceObjectGroupArray = array.filter(
      group => group.name === name || group.id === name,
    );
    if (serviceObjectGroupArray.length === 1) {
      return serviceObjectGroupArray[0].id;
    } else {
      return null;
    }
  }
}
