/** Link between two Graph Nodes. */
export class GraphLink {
    constructor(source: string, target: string) {
        this.source = source;
        this.target = target;
    }
    source: string;
    target: string;
}
