export class PreviewModalDto<T> {
  constructor(title: string, headers: string[], toBeAdded: T[], toBeDeleted: T[]) {
    this.title = title;
    this.headers = headers;
    this.toBeAdded = toBeAdded;
    this.toBeDeleted = toBeDeleted;
  }

  title: string;
  headers: string[];
  toBeDeleted: T[];
  toBeAdded: T[];
  confirm: boolean;
}
