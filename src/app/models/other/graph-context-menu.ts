import { GraphContextMenuItem } from './graph-context-menu-item';

/** Contains a collection of Graph Menu Items. */
export class GraphContextMenu {
  menuItems: Array<GraphContextMenuItem>;

  constructor() {
    this.menuItems = new Array<GraphContextMenuItem>();
  }

  getContextMenu() {
    const contextMenu = new Array<any>();

    this.menuItems.forEach(item => {
      contextMenu.push(item);
    });

    return contextMenu;
  }
}
