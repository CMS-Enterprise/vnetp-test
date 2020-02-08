export class TableRowWrapper<T> {
  public constructor(item: T) {
    this.item = item;
  }

  public isSelected = false;

  public item: T;
}
