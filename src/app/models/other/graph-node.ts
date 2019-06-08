export class GraphNode {
    constructor(group: number) {
        // GraphNode ID is dynamically generated, this ensures that there is
        // no requirement to specify another attribute to use as an Id.
        this.id = String(Math.random() * 10000);
        this.group = group;
    }
    id: string;
    name: string;
    group: number;
}
