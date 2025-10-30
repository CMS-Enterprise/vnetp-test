import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Datacenter, Tier, UserDto } from '../../../../client';
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
    private formBuilder: UntypedFormBuilder,
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
    this.buildForm();
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

  // adds generic fields for RFE/submit issue buttons
  public addUserInfo(form: UntypedFormGroup, type: string): any {
    form.value.timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' EST';
    form.value.user = this.auth.currentUserValue.cn;
    form.value.userEmail = this.auth.currentUserValue.mail;
    form.value.description = form.value.description.replaceAll('\n', '<br />'); // formatting for email body
    form.value.url = window.location.href;
    form.value.requestType = type;

    // For PROD - sends to Carl, Richard
    // form.value.toEmail = type.includes('issue') ? 'dcs_problem_group@bcbssc.com' : 'dcs_request_enhancement_group@bcbssc.com';

    // For DEV testing - only send to yourself
    form.value.toEmail = 'pmccardle@presidio.com';

    return form;
  }

  public saveFeedback(type): void {
    this.submitted = true;
    let form = type.includes('issue') ? this.issueForm : this.rfeForm;
    if (form.invalid) {
      return;
    }
    form = this.addUserInfo(form, type);
    // this.feedbackService.postCommentFeedback(form.value).subscribe(
    //   () => this.closeModal(),
    //   () => {},
    // );
    console.log('form', form);
  }

  private buildForm(): void {
    // TODO test len on description instead, because default text counts
    this.rfeForm = this.formBuilder.group({
      description: [this.rfeFormText, Validators.required],
      component: ['', Validators.required],
    });

    this.issueForm = this.formBuilder.group({
      description: [this.issueFormText, Validators.required],
      component: ['', Validators.required],
    });
    this.selected = '';
    this.submitted = false;
  }

  public openReportIssueModal(): void {
    this.ngx.getModal('reportIssueModal').open();
    this.buildForm();
  }

  public openRequestEnhancementModal(): void {
    this.ngx.getModal('requestEnhancementModal').open();
    this.buildForm();
  }

  public closeModal(): void {
    this.ngx.close('requestEnhancementModal');
    this.ngx.close('reportIssueModal');
    this.buildForm();
  }

  update(e) {
    this.selected = e.target.value;
  }

  get rfe() {
    return this.rfeForm.controls;
  }

  get issue() {
    return this.issueForm.controls;
  }
}
