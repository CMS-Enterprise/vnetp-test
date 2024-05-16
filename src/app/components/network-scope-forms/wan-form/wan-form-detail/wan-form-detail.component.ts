import { Component, Input, ViewEncapsulation } from '@angular/core';
import { WanForm } from '../../../../../../client/model/wanForm';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-wan-form-detail',
  templateUrl: './wan-form-detail.component.html',
  styleUrls: ['./wan-form-detail.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class WanFormDetailComponent {
  @Input() wanForm: WanForm;

  constructor(private router: Router, private route: ActivatedRoute) {}

  navigateToExternalRoutes(): void {
    const currentQueryParams = this.route.snapshot.queryParams;

    this.router.navigate(['/netcentric/wan-form', this.wanForm.id, 'external-routes'], {
      relativeTo: this.route,
      queryParams: currentQueryParams,
      state: { data: this.wanForm },
    });
  }

  openSubnetsDrawer(): void {}
}
