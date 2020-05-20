export class FilterEntry {
  Id: number;

  Name: string;

  Action: string;

  Protocol: string;

  SourcePorts: string;

  DestinationPorts: string;

  constructor(name: string, protocol: string, sourcePorts: string, destinationPorts: string) {
    this.Name = name;
    this.Protocol = protocol;
    this.SourcePorts = sourcePorts;
    this.DestinationPorts = destinationPorts;
  }
}
