import { ComponentFixture, TestBed } from '@angular/core/testing';

import { F5ConfigFilterComponent } from './f5-config-filter.component';
import { F5ConfigService } from '../f5-config.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

describe('F5ConfigFilterComponent', () => {
  let component: F5ConfigFilterComponent;
  let fixture: ComponentFixture<F5ConfigFilterComponent>;
  let mockF5ConfigStateManagementService: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockActivatedRoute = {
      params: of({ id: 'id' }),
    };
    mockF5ConfigStateManagementService = {
      getF5Configs: jest.fn().mockReturnValue(
        of([
          {
            id: 'id',
            data: {
              partitionInfo: {
                partition1: [{ name: 'virtualServer1' }],
              },
            },
          },
        ]),
      ),
    };
    TestBed.configureTestingModule({
      declarations: [F5ConfigFilterComponent],
      providers: [
        { provide: F5ConfigService, useValue: mockF5ConfigStateManagementService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      imports: [FormsModule],
    });
    fixture = TestBed.createComponent(F5ConfigFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize properties correctly', () => {
    expect(component.partitionNames).toEqual(['partition1']);
    expect(component.f5Config).toEqual({
      id: 'id',
      data: {
        partitionInfo: {
          partition1: [{ name: 'virtualServer1' }],
        },
      },
    });
    expect(component.partitionInfo).toEqual({ partition1: [{ name: 'virtualServer1' }] });
    expect(component.partitions).toEqual(['[ALL]', 'partition1']);
    expect(component.selectedPartition).toEqual('[ALL]');
  });

  it('should emit search query on search', () => {
    component.f5ConfigSearch = { emit: jest.fn() } as any;
    component.searchQuery = 'search query';
    component.onSearch();
    expect(component.f5ConfigSearch.emit).toHaveBeenCalledWith('search query');
  });

  it('should emit partition on partition select', () => {
    component.partitionSelected = { emit: jest.fn() } as any;
    component.selectPartition('partition1');
    expect(component.partitionSelected.emit).toHaveBeenCalledWith('partition1');
    expect(component.selectedPartition).toEqual('partition1');
  });

  it('should toggle drop down', () => {
    component.toggleDropdown();
    expect(component.showDropdown).toBeTruthy();
  });

  it('should not set showDropdown to false on click inside .custom-dropdown', () => {
    component.showDropdown = true;

    // Create and append an element with the class .custom-dropdown
    const dropdownElement = document.createElement('div');
    dropdownElement.className = 'custom-dropdown';
    document.body.appendChild(dropdownElement);

    // Dispatch a click event on the .custom-dropdown element
    dropdownElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.showDropdown).toBeTruthy();

    // Clean up
    document.body.removeChild(dropdownElement);
  });

  it('should set showDropdown to false on click outside .custom-dropdown', () => {
    component.showDropdown = true;

    // Create and append an element without the class .custom-dropdown
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    // Dispatch a click event on the new element
    outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.showDropdown).toBeFalsy();

    // Clean up
    document.body.removeChild(outsideElement);
  });
});
