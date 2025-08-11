import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { WanForm } from '../../../../../../client/model/wanForm';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-wan-form-detail',
  templateUrl: './wan-form-detail.component.html',
  styleUrls: ['./wan-form-detail.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
export class WanFormDetailComponent implements OnInit {
  @Input() wanForm: WanForm;
  dcsMode: string;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.dcsMode = this.route.snapshot.data.mode;
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
