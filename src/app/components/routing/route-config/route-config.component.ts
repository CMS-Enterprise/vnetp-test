import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExternalVrfConnection, V2AppCentricVrfsService, Vrf } from '../../../../../client';

@Component({
  selector: 'app-route-config',
  templateUrl: './route-config.component.html',
  styleUrls: ['./route-config.component.css'],
})
export class RouteConfigComponent implements OnInit {
  vrfId: string;
  vrf: Vrf;
  externalVrfConnections: ExternalVrfConnection[];

  constructor(private route: ActivatedRoute, private vrfService: V2AppCentricVrfsService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.vrfId = params.vrfId;
      this.getVrf();
    });
  }

  getVrf(): void {
    this.vrfService.getOneVrf({
      id: this.vrfId,
      relations: [
        'l3outs.externalFirewall.externalVrfConnections.internalRoutes',
        'l3outs.externalFirewall.externalVrfConnections.externalRoutes',
      ]
    }).subscribe(vrf => {
      this.vrf = vrf;
      this.externalVrfConnections = vrf.l3outs.flatMap(l3out => l3out.externalFirewall.externalVrfConnections);
    });
  }

  trackById(_: number, item: ExternalVrfConnection): string | undefined {
    return item?.id || item?.name;
  }
}
