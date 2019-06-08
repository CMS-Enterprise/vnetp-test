export class GraphNode {
    constructor(group: number) {
        this.id = String(Math.random() * 10000);
        this.group = group;
    }
    id: string;
    group: number;
}
