import { ActionData } from './action-data';

/** Represents a single Context Menu Item. */
export class GraphContextMenuItem {
  constructor(
    title: string,
    emitEvent: boolean = false,
    actionData?: ActionData,
  ) {
    this.title = title;
    this.emitEvent = emitEvent;

    if (actionData) {
      this.actionData = actionData;
    }
  }

  title: string;
  divider: boolean;
  action: any;

  actionData: ActionData;
  emitEvent: boolean;
}
