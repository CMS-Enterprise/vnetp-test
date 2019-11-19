/* Contains metadata that the graph component will return when a
left click or context menu item click occurs. */
export class ActionData {
  constructor(
    actionParentType: string,
    actionType: string,
    actionSubtype?: string,
  ) {
    this.ActionParentType = actionParentType;

    this.ActionType = actionType;

    if (actionSubtype) {
      this.ActionSubtype = actionSubtype;
    }
  }

  ActionParentType: string;

  ActionType: string;

  ActionSubtype: string;
}
