import { AppMessageType } from './app-message-type';

export class AppMessage {
  constructor(text: string, obj = {}, type = AppMessageType.Info) {
    this.Text = text;
    this.Type = type;
    this.Object = obj;

    if (type === AppMessageType.JobLaunchFail) {
      this.Success = false;
    } else {
      this.Success = true;
    }
  }

  Type: AppMessageType;

  Text: string;

  Object: any;

  Success: boolean;
}
