import { async, TestBed } from '@angular/core/testing';
import { NetworkObjectsGroupsModule } from './network-objects-groups.module';

describe('NetworkObjectsGroupsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NetworkObjectsGroupsModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NetworkObjectsGroupsModule).toBeDefined();
  });
});
