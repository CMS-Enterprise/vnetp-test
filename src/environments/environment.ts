import { DynamicEnvironment } from './dynamic-environment';

class Environment extends DynamicEnvironment {
  public production: boolean;
  public apiBase: string;
  public wikiBase: string;
  constructor() {
    super();
    this.production = false;
    this.apiBase = 'http://localhost:3000/api';
    this.wikiBase = 'http://wiki.draas.cdsvdc.lcl/index.php/UI';
  }
}

export const environment = new Environment();
