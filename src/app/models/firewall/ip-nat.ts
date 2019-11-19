export class IpNat {
  id: number;

  notes: string;

  name: string;

  protocol: string;

  two_way_relation: boolean;

  ip_address_from: string;

  ip_address_from_end: string;

  source_port_end: string;

  ip_address_to: string;

  ip_address_to_end: string;

  target_port_start: string;

  target_port_end: string;

  source_port_start: string;
}
