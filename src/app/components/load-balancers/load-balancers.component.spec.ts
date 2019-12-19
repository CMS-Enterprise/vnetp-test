// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { LoadBalancersComponent } from './load-balancers.component';
// import { VirtualServerModalComponent } from 'src/app/modals/virtual-server-modal/virtual-server-modal.component';
// import { PoolModalComponent } from 'src/app/modals/pool-modal/pool-modal.component';
// import { PoolMemberModalComponent } from 'src/app/modals/pool-member-modal/pool-member-modal.component';
// import { IRuleModalComponent } from 'src/app/modals/irule-modal/irule-modal.component';
// import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
// import { NgxMaskModule } from 'ngx-mask';
// import { AngularFontAwesomeModule } from 'angular-font-awesome';
// import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
// import { CookieService } from 'ngx-cookie-service';
// import { PapaParseModule } from 'ngx-papaparse';
// import { HealthMonitorModalComponent } from 'src/app/modals/health-monitor-modal/health-monitor-modal.component';
// import { ToastrModule } from 'ngx-toastr';
// import { ImportExportComponent } from '../import-export/import-export.component';
// import { TooltipComponent } from '../tooltip/tooltip.component';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';

// describe('LoadBalancersComponent', () => {
//   let component: LoadBalancersComponent;
//   let fixture: ComponentFixture<LoadBalancersComponent>;

//   const ngx = new NgxSmartModalServiceStub();

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         FormsModule,
//         ReactiveFormsModule,
//         NgxSmartModalModule,
//         PapaParseModule,
//         ToastrModule.forRoot(),
//         NgxMaskModule.forRoot(),
//         AngularFontAwesomeModule,
//         HttpClientTestingModule,
//       ],
//       declarations: [
//         LoadBalancersComponent,
//         VirtualServerModalComponent,
//         PoolModalComponent,
//         IRuleModalComponent,
//         PoolMemberModalComponent,
//         HealthMonitorModalComponent,
//         ImportExportComponent,
//         TooltipComponent,
//       ],
//       providers: [
//         { provide: NgxSmartModalService, useValue: ngx },
//         CookieService,
//         FormBuilder,
//       ],
//     }).compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(LoadBalancersComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
