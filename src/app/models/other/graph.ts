import { GraphLink } from './graph-link';
import { GraphNode } from './graph-node';

export class Graph {
  constructor(obj: any) {
    this.nodes = new Array<GraphNode>();
    this.links = new Array<GraphLink>();

    this.buildGraph(obj);
  }

  name: string;

  links: Array<GraphLink>;

  nodes: Array<GraphNode>;

  private buildGraph(obj: any) {
    this.objectIterator(obj, 1, this);
  }

  private objectIterator(
    obj: any,
    group: number,
    graph: Graph,
    parentId?: string
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
      if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
        obj[key].forEach(v => {
          this.objectIterator(v, (group + 1), graph, node.id);
        });
        // Set node title if suitable property available.
        if (obj.hasOwnProperty(key) && !Array.isArray(obj[key])
        && ['name', 'title'].includes(key.toLowerCase())) {
          node.name = obj[key];
         }
      }
    });

    graph.nodes.push(node);
  }
}
