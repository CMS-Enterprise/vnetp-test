import { CUSTOM_ELEMENTS_SCHEMA, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditLogViewModalComponent } from './audit-log-view-modal.component';

describe('AuditLogViewModalComponent', () => {
  let component: AuditLogViewModalComponent;
  let fixture: ComponentFixture<AuditLogViewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuditLogViewModalComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLogViewModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should expose proper changedPropsConfig columns', () => {
    const cols = component.changedPropsConfig.columns.map(c => c.name);
    expect(cols).toEqual(['Property', 'Value before', 'Value after']);
  });

  it('config should include Values Changed template that returns a TemplateRef', () => {
    fixture.detectChanges();
    const valuesChangedCol = component.config.columns.find(c => c.name === 'Values Changed');
    expect(valuesChangedCol).toBeTruthy();
    const tmpl = (valuesChangedCol as any).template();
    expect(tmpl instanceof TemplateRef).toBe(true);
  });

  it('changedTemplate renders rows when changedProperties present', () => {
    // Arrange an audit log with one changed property
    const auditLog: any = {
      changedProperties: [{ propertyName: 'fieldA', before: 'old', after: 'new' }],
    };
    component.auditLog = auditLog;
    fixture.detectChanges();

    // Render template manually
    const tpl = component.changedTemplate as TemplateRef<any>;
    const view = tpl.createEmbeddedView({ datum: auditLog });
    view.detectChanges();

    // Aggregate text from root nodes
    const text = view.rootNodes.map(n => (n.textContent || '').trim()).join(' ');
    expect(text).toContain('fieldA');
    expect(text).toContain('old');
    expect(text).toContain('new');
  });

  it('changedTemplate renders nothing when changedProperties is missing', () => {
    const auditLog: any = {};
    component.auditLog = auditLog;
    fixture.detectChanges();

    const tpl = component.changedTemplate as TemplateRef<any>;
    const view = tpl.createEmbeddedView({ datum: auditLog });
    view.detectChanges();

    const text = view.rootNodes.map(n => (n.textContent || '').trim()).join(' ');
    // Should not include headers or changed values (Angular may render internal binding markers)
    expect(text).not.toContain('Property');
    expect(text).not.toContain('Value before');
    expect(text).not.toContain('Value after');
    expect(text).not.toContain('fieldA');
    expect(text).not.toContain('old');
    expect(text).not.toContain('new');
  });
});
