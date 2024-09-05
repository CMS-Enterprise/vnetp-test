import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartitionDetailsComponent } from './partition-details.component';
import { F5ConfigService } from '../f5-config.service';
import { MockComponent, MockFontAwesomeComponent } from '../../../../test/mock-components';
import { of } from 'rxjs';
import { ApplicationPipesModule } from '../../../pipes/application-pipes.module';
import { ActivatedRoute } from '@angular/router';
import { F5RuntimePartitionInfo, F5Runtime, F5RuntimeVirtualServer } from '../../../../../client';

describe('PartitionDetailsComponent', () => {
  let component: PartitionDetailsComponent;
  let fixture: ComponentFixture<PartitionDetailsComponent>;
  let f5ConfigStateManagementService: any;
  let data: Partial<F5Runtime>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockActivatedRoute = {
      params: of({ id: 'id' }),
    };
    f5ConfigStateManagementService = {
      filterVirtualServers: jest
        .fn()
        .mockReturnValue([{ name: 'partition1', virtualServers: [{ name: 'virtualServer1' }] } as F5RuntimePartitionInfo]),
      getF5Configs: jest.fn().mockReturnValue(
        of([
          {
            id: 'id',
            data,
          } as F5Runtime,
        ]),
      ),
    };
    TestBed.configureTestingModule({
      declarations: [
        PartitionDetailsComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-virtual-server-card', inputs: ['virtualServer'] }),
        MockComponent({ selector: 'app-f5-config-filter', inputs: ['showPartitionFilter'] }),
      ],
      providers: [
        { provide: F5ConfigService, useValue: f5ConfigStateManagementService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      imports: [ApplicationPipesModule],
    });
    fixture = TestBed.createComponent(PartitionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('ngOnInit with empty data', () => {
    beforeEach(() => {
      data = {};
      fixture.detectChanges();
    });

    it('should set partitionInfoExists to false and partitionInfo to an empty array if partition info doesn’t exist', () => {
      expect(component.partitionInfoExists).toBeFalsy();
      expect(component.partitionInfo).toEqual([]);
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      data = {
        partitions: [{ name: 'partition1', virtualServers: [{ name: 'virtualServer1' }] } as F5RuntimePartitionInfo] as unknown as string[], // Temporarily casting to bypass type checks
      } as Partial<F5Runtime>;
      fixture.detectChanges();
    });

    it('should set filteredPartitionInfo', () => {
      expect(component.filteredPartitionInfo).toEqual([
        { name: 'partition1', virtualServers: [{ name: 'virtualServer1' }] } as F5RuntimePartitionInfo,
      ]);
    });

    it('should set selected partition', () => {
      component.onPartitionSelected('partition1');
      expect(component.selectedPartition).toEqual('partition1');
    });

    it('should set search query and call filterVirtualServers', () => {
      component.onSearch('searchQuery');
      expect(component.searchQuery).toEqual('searchquery');
      expect(f5ConfigStateManagementService.filterVirtualServers).toHaveBeenCalledWith(component.partitionInfo, 'searchquery');
    });

    it('should handle expanded change', () => {
      const virtualServer = { name: 'virtualServer1' } as F5RuntimeVirtualServer;
      component.handleExpandedChange(virtualServer, true);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(virtualServer['expanded']).toBeTruthy();
    });
  });
});
