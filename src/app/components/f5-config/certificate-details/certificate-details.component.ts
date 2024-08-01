import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { F5ConfigService } from '../f5-config.service';
import { F5Runtime } from '../../../../../client';
import { LiteTableConfig } from '../../../common/lite-table/lite-table.component';

@Component({
  selector: 'app-cert-details',
  templateUrl: './certificate-details.component.html',
})
export class CertificateDetailsComponent implements OnInit, OnDestroy {
  urlF5Id: string;
  f5Config: F5Runtime;
  certInfo: any;

  config: LiteTableConfig<any> = {
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Subject', property: 'subject' },
      { name: 'Partition', property: 'partition' },
      { name: 'Expiration Date', property: 'expirationString' },
    ],
  };

  constructor(private f5ConfigStateManagementService: F5ConfigService, private route: ActivatedRoute) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.urlF5Id = params?.id;
      this.f5ConfigStateManagementService.getF5Configs().subscribe(data => {
        this.f5Config = data.find(f5 => f5?.id === this.urlF5Id);
        if (this.f5Config) {
          const f5 = this.f5Config as any;
          this.certInfo = f5?.data?.certInfo;
        }
      });
    });
  }
}
