import { GraphContextMenu } from './graph-context-menu';

/** Represents a Node on a Graph. */

export class GraphNode {
    constructor(group: number) {
        // GraphNode ID is dynamically generated, this ensures that there is
        // no requirement to specify another attribute to use as an Id.
        this.id = String(Math.random() * 1000000);
        this.group = group;
    }
    id: string;
    name: string;
    group: number;
    contextMenu: GraphContextMenu;

    getContextMenu() {
        if (this.contextMenu) {
            return this.contextMenu.getContextMenu();
        }
    }
}
