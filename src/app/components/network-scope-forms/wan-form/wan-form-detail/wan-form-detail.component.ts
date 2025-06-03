import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { WanForm } from '../../../../../../client/model/wanForm';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { RouteDataUtil } from 'src/app/utils/route-data.util';

@Component({
  selector: 'app-wan-form-detail',
  templateUrl: './wan-form-detail.component.html',
  styleUrls: ['./wan-form-detail.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class WanFormDetailComponent implements OnInit {
  @Input() wanForm: WanForm;
  public dcsMode: ApplicationMode;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.dcsMode = RouteDataUtil.getApplicationModeFromRoute(this.route);

    if (!this.dcsMode) {
      console.error('WanFormDetailComponent: Application mode could not be determined via RouteDataUtil.');
      // Fallback or error handling if necessary
    }
  }

  navigateToWanFormSubnets(): void {
    const currentQueryParams = this.route.snapshot.queryParams;
    this.router.navigate([`/${this.dcsMode}/wan-form`, this.wanForm.id, 'wan-form-subnets'], {
      relativeTo: this.route,
      queryParams: currentQueryParams,
      state: { data: this.wanForm },
    });
  }

  navigateToExternalRoute(): void {
    const currentQueryParams = this.route.snapshot.queryParams;
    this.router.navigate([`/${this.dcsMode}/wan-form`, this.wanForm.id, 'external-route'], {
      relativeTo: this.route,
      queryParams: currentQueryParams,
      state: { data: this.wanForm },
    });
  }
}
