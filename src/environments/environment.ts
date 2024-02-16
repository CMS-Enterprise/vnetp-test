import { DynamicEnvironment } from './dynamic-environment';

class Environment extends DynamicEnvironment {
  public production: boolean;
  public apiBase: string;
  public wikiBase: string;
  public dcsLocations;
  public dcsVersion: string;
  constructor() {
    super();
    this.production = false;
    this.apiBase = 'http://localhost:3000/api';
    this.dcsVersion = '3.0';
  }
}

export const environment = new Environment();
