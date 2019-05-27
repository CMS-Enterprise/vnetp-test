import { AppMessageType } from './app-message-type';

export class AppMessage {
    constructor(text: string, type = AppMessageType.Info) {
        this.Text = text;
        this.Type = type;

        if (type === AppMessageType.JobLaunchFail) {
            this.Success = false;
        } else {
            this.Success = true;
        }
    }

    Type: AppMessageType;

    Text: string;

    Success: boolean;
}
