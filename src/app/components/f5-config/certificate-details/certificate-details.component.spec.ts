import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CertificateDetailsComponent } from './certificate-details.component';
import { F5ConfigService } from '../f5-config.service';
import { V1RuntimeDataF5ConfigService } from '../../../../../client';

describe('CertificateDetailsComponent', () => {
  let component: CertificateDetailsComponent;
  let fixture: ComponentFixture<CertificateDetailsComponent>;
  let mockF5ConfigService: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockF5ConfigService = {
      getF5Configs: jest.fn().mockReturnValue(
        of([
          {
            id: '123',
            data: {
              certInfo: [
                { name: 'cert1', expirationDate: 123, subject: 'subject1', partition: 'partition1', expirationString: '2025-01-01' },
                { name: 'cert2', expirationDate: 456, subject: 'subject2', partition: 'partition2', expirationString: '2025-06-01' },
              ],
            },
          },
        ]),
      ),
    };

    mockActivatedRoute = {
      params: of({ id: '123' }),
    };

    TestBed.configureTestingModule({
      declarations: [CertificateDetailsComponent],
      providers: [
        { provide: F5ConfigService, useValue: mockF5ConfigService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: V1RuntimeDataF5ConfigService, useValue: {} }, // Mock the dependency without methods as it isn't used directly
      ],
    });

    fixture = TestBed.createComponent(CertificateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set urlF5Id from route params', () => {
    expect(component.urlF5Id).toBe('123');
  });

  it('should call getF5Configs and set f5Config', () => {
    expect(mockF5ConfigService.getF5Configs).toHaveBeenCalled();
    expect(component.f5Config).toEqual(expect.objectContaining({ id: '123' }));
  });

  it('should sort certInfo by expiration date in ascending order', () => {
    const sortedCertInfo = [
      { name: 'cert1', expirationDate: 123, subject: 'subject1', partition: 'partition1', expirationString: '2025-01-01' },
      { name: 'cert2', expirationDate: 456, subject: 'subject2', partition: 'partition2', expirationString: '2025-06-01' },
    ];

    expect(component.certInfo).toEqual(sortedCertInfo);
  });

  it('should configure the table with correct columns', () => {
    expect(component.config.columns).toEqual([
      { name: 'Name', property: 'name' },
      { name: 'Subject', property: 'subject' },
      { name: 'Partition', property: 'partition' },
      { name: 'Expiration Date', property: 'expirationString' },
    ]);
  });
});
