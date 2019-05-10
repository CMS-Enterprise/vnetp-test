import { AppMessageType } from './app-message-type';

export class AppMessage {
    constructor(text: string, type = AppMessageType.Info) {
        this.Text = text;
        this.Type = type;
    }

    Type: AppMessageType;

    Text: string;
}
