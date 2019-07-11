import { GraphNode } from './graph-node';
import { ActionData } from './action-data';

/** DTO containing ActionData and the GraphNode that was clicked. */
export class ClickResult {

    constructor(graphNode: GraphNode, actionData: ActionData) {
        this.graphNode = graphNode;
        this.actionData = actionData;
    }

    graphNode: GraphNode;
    actionData: ActionData;
}