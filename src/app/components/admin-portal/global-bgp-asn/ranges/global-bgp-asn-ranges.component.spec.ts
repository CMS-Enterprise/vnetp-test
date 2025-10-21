import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GlobalBgpAsnRangesComponent } from './global-bgp-asn-ranges.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { V3GlobalBgpRangesService } from 'client';

describe('GlobalBgpAsnRangesComponent', () => {
  let component: GlobalBgpAsnRangesComponent;
  let fixture: ComponentFixture<GlobalBgpAsnRangesComponent>;

  let mockModal: any;
  let mockApi: any;

  beforeEach(async () => {
    const modalInstance = {
      onCloseFinished: {
        subscribe: (cb: () => void) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          cb && cb();
          return { unsubscribe() {} };
        },
      },
      open: jest.fn(),
    };
    mockModal = {
      setModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue(modalInstance),
    } as Partial<NgxSmartModalService> as any;

    mockApi = {
      listRangesGlobalBgpAsn: jest.fn().mockReturnValue(of([])),
      allocationsSummaryGlobalBgpAsn: jest.fn(),
    } as Partial<V3GlobalBgpRangesService> as any;

    await TestBed.configureTestingModule({
      declarations: [GlobalBgpAsnRangesComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: mockModal },
        { provide: V3GlobalBgpRangesService, useValue: mockApi },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalBgpAsnRangesComponent);
    component = fixture.componentInstance;
  });

  it('should create and call load on init', () => {
    const spy = jest.spyOn(component, 'load');
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(spy).toHaveBeenCalled();
  });

  it('load handles empty ranges', () => {
    mockApi.listRangesGlobalBgpAsn.mockReturnValueOnce(of([]));
    component.load();
    expect(component.data).toEqual([]);
    expect(component.tableData).toEqual({ data: [], count: 0, total: 0, page: 1, pageCount: 1 });
    expect(mockApi.allocationsSummaryGlobalBgpAsn).not.toHaveBeenCalled();
  });

  it('load decorates ranges with allocation summaries', () => {
    const ranges = [{ id: 'r1', name: 'R1', start: 1, end: 10 } as any, { id: 'r2', name: 'R2', start: 11, end: 20 } as any];
    mockApi.listRangesGlobalBgpAsn.mockReturnValueOnce(of(ranges));
    mockApi.allocationsSummaryGlobalBgpAsn
      .mockReturnValueOnce(of({ allocatedCount: 2, freeCount: 8, usedPercent: 20 }))
      .mockReturnValueOnce(of({ allocatedCount: 4, freeCount: 6, usedPercent: 40 }));

    component.load();
    expect(mockApi.allocationsSummaryGlobalBgpAsn).toHaveBeenCalledTimes(2);
    expect(component.tableData.count).toBe(2);
    expect(component.data[0]).toEqual(expect.objectContaining({ allocatedCount: 2, freeCount: 8, usedPercent: 20 }));
    expect(component.data[1]).toEqual(expect.objectContaining({ allocatedCount: 4, freeCount: 6, usedPercent: 40 }));
  });

  it('load sets defaults when allocations summary errors', () => {
    const ranges = [{ id: 'r3', name: 'R3', start: 21, end: 30 } as any];
    mockApi.listRangesGlobalBgpAsn.mockReturnValueOnce(of(ranges));
    mockApi.allocationsSummaryGlobalBgpAsn.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.load();
    expect(component.data[0]).toEqual(expect.objectContaining({ allocatedCount: 0, freeCount: 0, usedPercent: 0 }));
    expect(component.tableData.count).toBe(1);
  });

  it('load handles list error by clearing data', () => {
    mockApi.listRangesGlobalBgpAsn.mockReturnValueOnce(throwError(() => new Error('fail')));
    component.load();
    expect(component.data).toEqual([]);
    expect(component.tableData).toEqual({ data: [], count: 0, total: 0, page: 1, pageCount: 1 });
  });

  it('openCreate wires modal and triggers load after close', () => {
    const spy = jest.spyOn(component, 'load');
    component.openCreate();
    expect(mockModal.setModalData).toHaveBeenCalledWith({ ModalMode: 'Create' }, 'globalBgpAsnRangeModal');
    expect(mockModal.getModal).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it('openEdit wires modal with range and triggers load after close', () => {
    const spy = jest.spyOn(component, 'load');
    const range = { id: 'id1', name: 'Range 1' } as any;
    component.openEdit(range);
    expect(mockModal.setModalData).toHaveBeenCalledWith({ ModalMode: 'Edit', range }, 'globalBgpAsnRangeModal');
    expect(mockModal.getModal).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });
});
