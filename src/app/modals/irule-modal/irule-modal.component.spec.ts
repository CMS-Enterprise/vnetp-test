// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
// import {
//   FormsModule,
//   FormBuilder,
//   Validators,
//   ReactiveFormsModule,
// } from '@angular/forms';
// import { NgxMaskModule } from 'ngx-mask';
// import { IRuleModalComponent } from './irule-modal.component';
// import { AngularFontAwesomeModule } from 'angular-font-awesome';
// import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
// import { NgxSmartModalServiceStub } from '../modal-mock';

// describe('IRuleModalComponent', () => {
//   let component: IRuleModalComponent;
//   let fixture: ComponentFixture<IRuleModalComponent>;

//   const ngx = new NgxSmartModalServiceStub();

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         AngularFontAwesomeModule,
//         FormsModule,
//         NgxSmartModalModule,
//         ReactiveFormsModule,
//         NgxMaskModule.forRoot(),
//       ],
//       declarations: [IRuleModalComponent, TooltipComponent],
//       providers: [
//         { provide: NgxSmartModalService, useValue: ngx },
//         FormBuilder,
//         Validators,
//       ],
//     })
//       .compileComponents()
//       .then(() => {
//         fixture = TestBed.createComponent(IRuleModalComponent);
//         component = fixture.componentInstance;
//       });
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(IRuleModalComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   // Initial Form State
//   it('name should be required', () => {
//     const name = component.form.controls.name;
//     expect(name.valid).toBeFalsy();
//   });

//   it('content should be required', () => {
//     const content = component.form.controls.content;
//     expect(content.valid).toBeFalsy();
//   });
// });
