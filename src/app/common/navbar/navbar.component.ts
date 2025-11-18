import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Datacenter, Tier, UserDto, V1MailService } from '../../../../client';
import { environment } from 'src/environments/environment';
import { DatacenterContextService } from '../../services/datacenter-context.service';
import { TierContextService } from '../../services/tier-context.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  public user: UserDto;
  public userRoles: string[];
  public tenant: string;
  public tenantAccountNumber: string;
  private currentUserSubscription: Subscription;
  private currentTenantSubscription: Subscription;
  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;
  public currentDatacenter: Datacenter;
  public currentTier: Tier;
  public undeployedChangeObjects: any;
  public environment = environment;
  public dcsVersion: string = this.environment?.dynamic?.dcsVersion;
  public role: string;
  public rfeForm: UntypedFormGroup;
  public issueForm: UntypedFormGroup;
  public submitted: boolean;

  constructor(
    private ngx: NgxSmartModalService,
    private auth: AuthService,
    private datacenterContextService: DatacenterContextService,
    private tierContextService: TierContextService,
  ) {}

  comps = ['Network Objects', 'Service Objects', 'Load Balancer', 'Routing', 'Firewall Rules', 'VLANs', 'Tiers', 'Subnets', 'NAT Rules'];
  rfeFormText =
    'What is it doing now? \nWhat do you want it to do? \nWhat are the benefits of doing this? \nHow will this be helpful to you?\n';
  issueFormText =
    'What is the error? \nHas it worked before? \nWhen did it last work? \nWhat were you expecting it to do? \nWhat did it do instead?\n';
  selected = '';

  public openLogoutModal(): void {
    this.ngx.getModal('logoutModal').open();
  }

  public logout(): void {
    this.ngx.close('logoutModal');
    this.auth.logout();
  }

  ngOnInit(): void {
    this.currentTenantSubscription = this.auth.currentTenant.subscribe(tenant => {
      this.tenant = tenant;
      this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
        this.user = user;
        if (this.user && this.tenant) {
          this.userRoles = this.user.dcsPermissions.find(d => d.tenant === this.tenant || d.tenant === '*').roles;
          // this is a slight trick for the user, if they are a RO user regardless of prefix (network, x86, etc...)
          // show them all dropdown options, they will get denied at the component level
          // this allows for more flexibility of the word "admin" in the HTML with no risk
          if (this.userRoles) {
            const ro = this.userRoles.find(role => {
              if (role.includes('ro')) {
                return true;
              }
            });

            if (ro) {
              this.userRoles = ['admin'];
            }
          }
        }
      });
    });

    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(datacenter => {
      if (datacenter) {
        this.currentDatacenter = datacenter;
        this.currentTierSubscription = this.tierContextService.currentTier.subscribe(tier => {
          if (tier) {
            this.currentTier = tier;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([
      this.currentUserSubscription,
      this.currentTenantSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }

  public openReportIssueModal(): void {
    this.ngx.getModal('reportIssueModal').open();
  }

  public openRequestEnhancementModal(): void {
    this.ngx.getModal('requestEnhancementModal').open();
  }
}
