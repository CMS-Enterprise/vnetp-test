import { GraphNode } from './graph-node';
import { ActionData } from './action-data';

/** DTO containing the graph node, action data and object that a context 
 * that are related to a context menu item that was clicked.
*/
export class GraphContextMenuResult {

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

