import { GraphContextMenuItem } from './graph-context-menu-item';
import { GraphNode } from './graph-node';

export class GraphContextMenuResult {

    constructor(graphNode: GraphNode, graphContextMenuItem: GraphContextMenuItem) {
        this.graphNode = graphNode;
        this.graphContextMenuItem = graphContextMenuItem;
    }

    graphNode: GraphNode;

    graphContextMenuItem: GraphContextMenuItem;
}

