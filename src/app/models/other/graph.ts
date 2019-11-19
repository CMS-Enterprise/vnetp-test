import { GraphLink } from './graph-link';
import { GraphNode } from './graph-node';
import { GraphContextMenu } from './graph-context-menu';
import { GraphContextMenuResult } from './graph-context-menu-result';
import { GraphContextMenuItem } from './graph-context-menu-item';

/** Constructs a Graph by recursively iterating an object and its children. */
export class Graph {
  constructor(
    obj: any,
    ignoreArray?: Array<string>,
    nameArray?: Array<string>,
    contextMenuArray?: Array<GraphContextMenu>,
    contextMenuCallback?: any,
  ) {
    this.nodes = new Array<GraphNode>();
    this.links = new Array<GraphLink>();

    if (!ignoreArray) {
      this.ignoreArray = new Array<string>();
    } else {
      this.ignoreArray = ignoreArray;
    }

    if (!nameArray) {
      this.nameArray = new Array<string>();
    } else {
      this.nameArray = nameArray;
    }

    if (!contextMenuArray) {
      this.contextMenuArray = new Array<GraphContextMenu>();
    } else {
      this.contextMenuArray = contextMenuArray;
    }

    if (!contextMenuCallback) {
      this.contextMenuCallback = null;
    } else {
      this.contextMenuCallback = contextMenuCallback;
    }

    this.buildGraph(obj);
  }

  name: string;

  links: Array<GraphLink>;

  nodes: Array<GraphNode>;

  ignoreArray: Array<string>;

  nameArray: Array<string>;

  contextMenuArray: Array<GraphContextMenu>;

  contextMenuCallback: any;

  private buildGraph(obj: any) {
    this.objectIterator(obj, 1, this);
  }

  private objectIterator(
    obj: any,
    group: number,
    graph: Graph,
    parentId?: string,
  ) {
    // Build a GraphNode for the object and add it to the Graph.
    const node = new GraphNode(group);

    // If the GraphNode has a parent create a link between it and the parent
    // and add it to the graph.
    if (parentId) {
      graph.links.push(new GraphLink(node.id, parentId));
    }

    Object.keys(obj).forEach(key => {
      // Recursively iterate child arrays.
      if (
        obj.hasOwnProperty(key) &&
        Array.isArray(obj[key]) &&
        !this.ignoreArray.includes(key.toLowerCase())
      ) {
        obj[key].forEach(v => {
          this.objectIterator(v, group + 1, graph, node.id);
        });
      }

      // Set node title if suitable property available.
      if (
        obj.hasOwnProperty(key) &&
        !Array.isArray(obj[key]) &&
        this.nameArray.includes(key.toLowerCase())
      ) {
        node.name = obj[key];
      }
    });

    node.contextMenu = this.getGroupContextMenu(group, node, obj);

    graph.nodes.push(node);
  }

  private getGroupContextMenu(group, node, obj) {
    if (!this.contextMenuArray) {
      return;
    }

    if (this.contextMenuArray[group - 1]) {
      const contextMenu = this.contextMenuArray[group - 1];
      const nodeContextMenu = new GraphContextMenu();

      // TODO: Bind context menu callback to all menu items with action.
      contextMenu.menuItems.forEach(mi => {
        const nodeContextMenuItem = new GraphContextMenuItem(
          mi.title,
          false,
          mi.actionData,
        );

        if (mi.emitEvent) {
          nodeContextMenuItem.action = () =>
            this.contextMenuCallback.emit(
              new GraphContextMenuResult(node, mi.actionData, obj),
            );
        }
        nodeContextMenu.menuItems.push(nodeContextMenuItem);
      });

      return nodeContextMenu;
    }

    return null;
  }
}
