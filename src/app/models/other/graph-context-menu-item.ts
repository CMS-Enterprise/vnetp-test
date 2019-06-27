export class GraphContextMenuItem {

    constructor(title: string, emitEvent: boolean = false) {
        this.title = title;
        this.emitEvent = emitEvent;
    }

    title: string;
    divider: boolean;
    action: any;

    actionString: string;
    emitEvent: boolean;
}