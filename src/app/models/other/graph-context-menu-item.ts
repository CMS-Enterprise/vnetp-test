export class GraphContextMenuItem {

    constructor(title: string) {
        this.title = title;
    }

    title: string;
    divider: boolean;
    action: any;
}