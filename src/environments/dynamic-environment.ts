declare let window: any;

export class DynamicEnvironment {
  public get dynamic() {
    return window.config.environment;
  }
}
