export class GraphContextMenuItem {

    constructor(title: string, action?: any, resolveId?: boolean) {
        this.title = title;

        if (action) {
        this.action = action;
    }
    }

    title: string;
    divider: boolean;
    action: any;


}