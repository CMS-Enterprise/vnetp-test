import { DynamicEnvironment } from './dynamic-environment';

class Environment extends DynamicEnvironment {
  public production: boolean;
  public apiBase: string;
  public wikiBase: string;
  public dcsLocations;
  public dcsVersion: string;
  constructor() {
    super();
    this.production = true;
    this.dcsLocations = [
      { name: 'East', url: 'http://localhost-east:4200' },
      { name: 'West', url: 'http://localhost-west:4200' },
    ];
    this.apiBase = '/api';
    this.wikiBase = 'http://wiki.draas.cdsvdc.lcl/index.php/UI';
    this.dcsVersion = '1.15.1';
  }
}

export const environment = new Environment();
