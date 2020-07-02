import { async, TestBed } from '@angular/core/testing';
import { ServiceObjectsGroupsModule } from './service-objects-groups.module';

describe('ServiceObjectsGroupsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ServiceObjectsGroupsModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ServiceObjectsGroupsModule).toBeDefined();
  });
});
