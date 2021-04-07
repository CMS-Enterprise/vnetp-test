import { Component, OnInit } from '@angular/core';
import { PhysicalServer, V1PhysicalServersService, PhysicalServerNetworkPort } from 'api_client';
import { ActivatedRoute, Router } from '@angular/router';
import ConversionUtil from 'src/app/utils/ConversionUtil';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-physical-server-detail',
  templateUrl: './physical-server-detail.component.html',
})
export class PhysicalServerDetailComponent implements OnInit {
  Id: string;
  PhysicalServer: PhysicalServer;

  networkPorts: PhysicalServerNetworkPort[];
  ConversionUtil = ConversionUtil;

  constructor(
    private entityService: EntityService,
    private route: ActivatedRoute,
    private router: Router,
    private physicalServerService: V1PhysicalServersService,
  ) {}

  getPhysicalServer() {
    this.physicalServerService
      .v1PhysicalServersIdGet({
        id: this.Id,
      })
      .subscribe(data => {
        this.PhysicalServer = data;
      });
  }

  public deletePhysicalServer(physicalServer: PhysicalServer): void {
    this.entityService.deleteEntity(physicalServer, {
      entityName: 'Physical Server',
      delete$: this.physicalServerService.v1PhysicalServersIdDelete({
        id: physicalServer.id,
      }),
      softDelete$: this.physicalServerService.v1PhysicalServersIdSoftDelete({
        id: physicalServer.id,
      }),
      onSuccess: () => {
        if (physicalServer.deletedAt) {
          this.router.navigate(['/physical-server'], {
            queryParamsHandling: 'merge',
          });
        } else {
          this.getPhysicalServer();
        }
      },
    });
  }

  restorePhysicalServer(ps: PhysicalServer) {
    if (ps.deletedAt) {
      this.physicalServerService
        .v1PhysicalServersIdRestorePatch({
          id: ps.id,
        })
        .subscribe(() => {
          this.getPhysicalServer();
        });
    }
  }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.getPhysicalServer();
  }
}
