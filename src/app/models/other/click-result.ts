import { GraphNode } from './graph-node';
import { ActionData } from './action-data';

export class ClickResult {
    constructor(graphNode: GraphNode, actionData: ActionData, object?: any) {
        this.graphNode = graphNode;
        this.actionData = actionData;

        if (object) {
            this.object = object;
        }
    }

    graphNode: GraphNode;

    actionData: ActionData;

    object: any;
}