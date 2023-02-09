import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { FilterEntryModalComponent } from './filter-entry-modal.component';

describe('FilterEntryModalComponent', () => {
  let component: FilterEntryModalComponent;
  let fixture: ComponentFixture<FilterEntryModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilterEntryModalComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent],
      imports: [HttpClientModule, ReactiveFormsModule, NgSelectModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterEntryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
  const isRequired = (prop: string): boolean => {
    const fc = getFormControl(prop);
    fc.setValue(null);
    return !!fc.errors && !!fc.errors.required;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('etherType', () => {
    it('ip Protocol', () => {
      const etherType = getFormControl('etherType');

      etherType.setValue('ip');
      expect(isRequired('ipProtocol')).toBe(true);

      etherType.setValue('ipv4');
      expect(isRequired('ipProtocol')).toBe(true);

      etherType.setValue('ipv6');
      expect(isRequired('ipProtocol')).toBe(true);

      etherType.setValue(null);
      expect(isRequired('ipProtocol')).toBe(false);
    });

    it('Match Only Fragments', () => {
      const etherType = getFormControl('etherType');

      etherType.setValue('ip');
      expect(isRequired('matchOnlyFragments')).toBe(true);

      etherType.setValue('ipv4');
      expect(isRequired('matchOnlyFragments')).toBe(true);

      etherType.setValue('ipv6');
      expect(isRequired('matchOnlyFragments')).toBe(true);

      etherType.setValue(null);
      expect(isRequired('matchOnlyFragments')).toBe(false);
    });

    it('ARP Flags', () => {
      const etherType = getFormControl('etherType');

      etherType.setValue('arp');
      expect(isRequired('arpFlag')).toBe(true);

      etherType.setValue(null);
      expect(isRequired('arpFlag')).toBe(false);
    });
  });

  describe('ipProtocol', () => {
    it('Source From Port', () => {
      const etherType = getFormControl('etherType');
      const ipProtocol = getFormControl('ipProtocol');

      etherType.setValue('ip');
      ipProtocol.setValue('tcp');

      expect(isRequired('sourceFromPort')).toBe(true);

      ipProtocol.setValue('icmp');

      expect(isRequired('sourceFromPort')).toBe(false);
    });

    it('Source To Port', () => {
      const etherType = getFormControl('etherType');
      const ipProtocol = getFormControl('ipProtocol');

      etherType.setValue('ip');
      ipProtocol.setValue('tcp');

      expect(isRequired('sourceToPort')).toBe(true);

      ipProtocol.setValue('icmp');

      expect(isRequired('sourceToPort')).toBe(false);
    });

    it('Destination From Port', () => {
      const etherType = getFormControl('etherType');
      const ipProtocol = getFormControl('ipProtocol');

      etherType.setValue('ip');
      ipProtocol.setValue('tcp');

      expect(isRequired('destinationFromPort')).toBe(true);

      ipProtocol.setValue('icmp');

      expect(isRequired('destinationFromPort')).toBe(false);
    });

    it('Destination To Port', () => {
      const etherType = getFormControl('etherType');
      const ipProtocol = getFormControl('ipProtocol');

      etherType.setValue('ip');
      ipProtocol.setValue('tcp');

      expect(isRequired('destinationToPort')).toBe(true);

      ipProtocol.setValue('icmp');

      expect(isRequired('destinationToPort')).toBe(false);
    });

    it('TCP Flags', () => {
      const etherType = getFormControl('etherType');
      const ipProtocol = getFormControl('ipProtocol');

      etherType.setValue('ip');
      ipProtocol.setValue('tcp');

      expect(isRequired('tcpFlags')).toBe(true);

      ipProtocol.setValue('udp');

      expect(isRequired('tcpFlags')).toBe(false);
    });

    it('Stateful', () => {
      const etherType = getFormControl('etherType');
      const ipProtocol = getFormControl('ipProtocol');

      etherType.setValue('ip');
      ipProtocol.setValue('tcp');

      expect(isRequired('stateful')).toBe(true);

      ipProtocol.setValue('udp');

      expect(isRequired('stateful')).toBe(false);
    });
  });

  describe('Source From Port', () => {
    it('Source To Port', () => {
      const etherType = getFormControl('etherType');
      const ipProtocol = getFormControl('ipProtocol');
      const sourceFromPort = getFormControl('sourceFromPort');
      const sourceToPort = getFormControl('sourceToPort');

      etherType.setValue('ip');
      ipProtocol.setValue('tcp');
      sourceFromPort.setValue(1234);

      sourceToPort.setValue(1233);
      expect(sourceToPort.valid).toBeFalsy();

      sourceToPort.setValue(1234);
      expect(sourceToPort.valid).toBeTruthy();
    });
  });

  describe('Destination From Port', () => {
    it('Destination To Port', () => {
      const etherType = getFormControl('etherType');
      const ipProtocol = getFormControl('ipProtocol');
      const destinationFromPort = getFormControl('destinationFromPort');
      const destinationToPort = getFormControl('destinationToPort');

      etherType.setValue('ip');
      ipProtocol.setValue('tcp');
      destinationFromPort.setValue(1234);

      destinationToPort.setValue(1233);
      expect(destinationToPort.valid).toBeFalsy();

      destinationToPort.setValue(1234);
      expect(destinationToPort.valid).toBeTruthy();
    });
  });
});
