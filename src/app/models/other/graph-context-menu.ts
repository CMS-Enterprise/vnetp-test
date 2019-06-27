import { GraphContextMenuItem } from './graph-context-menu-item';

export class GraphContextMenu {
  menuItems: Array<GraphContextMenuItem>;

  getContextMenu() {
    const contextMenu = new Array<any>();

    this.menuItems.forEach(item => {
      contextMenu.push(item);
    });

    return contextMenu;
  }
}
