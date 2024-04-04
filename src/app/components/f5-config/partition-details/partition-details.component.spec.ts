import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartitionDetailsComponent } from './partition-details.component';
import { F5ConfigService } from '../f5-config.service';
import { MockComponent } from '../../../../test/mock-components';
import { of } from 'rxjs';
import { ApplicationPipesModule } from '../../../pipes/application-pipes.module';

describe('PartitionDetailsComponent', () => {
  let component: PartitionDetailsComponent;
  let fixture: ComponentFixture<PartitionDetailsComponent>;
  let f5ConfigStateManagementService: any;

  beforeEach(() => {
    f5ConfigStateManagementService = {
      filterVirtualServers: jest.fn().mockReturnValue({ partition1: [{ name: 'virtualServer1' }] }),
      currentF5Config: of({
        data: {
          partitionInfo: {
            partition1: [{ name: 'virtualServer1' }],
          },
        },
      }),
    };
    TestBed.configureTestingModule({
      declarations: [
        PartitionDetailsComponent,
        MockComponent({ selector: 'app-virtual-server-card', inputs: ['virtualServer'] }),
        MockComponent({ selector: 'app-f5-config-filter', inputs: ['showPartitionFilter'] }),
      ],
      providers: [{ provide: F5ConfigService, useValue: f5ConfigStateManagementService }],
      imports: [ApplicationPipesModule],
    });
    fixture = TestBed.createComponent(PartitionDetailsComponent);
    component = fixture.componentInstance;
    component.f5ConfigSubscription = { unsubscribe: jest.fn() } as any;
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should set partitionNames and filteredPartitionNames', () => {
      expect(component.partitionNames).toEqual(['partition1']);
      expect(component.filteredPartitionNames).toEqual(['partition1']);
    });
    it('should set filteredPartitionInfo', () => {
      expect(component.filteredPartitionInfo).toEqual({ partition1: [{ name: 'virtualServer1' }] });
    });
  });

  it('should set selected partition', () => {
    component.onPartitionSelected('partition1');
    expect(component.selectedPartition).toEqual('partition1');
  });

  it('should set search query and call filterVirtualServers', () => {
    component.onSearch('searchQuery');
    expect(component.searchQuery).toEqual('searchquery');
    expect(f5ConfigStateManagementService.filterVirtualServers).toHaveBeenCalledWith(
      { partition1: [{ name: 'virtualServer1' }] },
      'searchquery',
    );
  });

  it('should handle expanded change', () => {
    const virtualServer = { name: 'virtualServer1', expanded: false };
    component.handleExpandedChange(virtualServer, true);
    expect(virtualServer.expanded).toBeTruthy();
  });
});
