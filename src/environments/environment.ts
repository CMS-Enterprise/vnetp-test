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
    this.dcsLocations = [
      { name: 'East', url: 'http://localhost-east:4200' },
      { name: 'West', url: 'http://localhost-west:4200' },
    ];
    this.apiBase = 'http://localhost:3000/api';
    this.wikiBase = 'http://wiki.draas.cdsvdc.lcl/index.php/UI';
    this.dcsVersion = '2.14.3';
  }
}

export const environment = new Environment();
