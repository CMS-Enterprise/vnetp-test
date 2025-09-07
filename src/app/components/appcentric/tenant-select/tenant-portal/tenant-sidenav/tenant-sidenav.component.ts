import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

export interface SidenavItem {
  name: string;
  route?: string[];
  subItems?: SidenavItem[];
  id?: string;
  tooltip?: string;
  isSubItem?: boolean;
}

export interface SidenavGroup {
  name: string;
  icon: string;
  items: SidenavItem[];
  expanded?: boolean;
  id: string;
}

@Component({
  selector: 'app-tenant-sidenav',
  templateUrl: './tenant-sidenav.component.html',
  styleUrls: ['./tenant-sidenav.component.scss'],
})
export class TenantSidenavComponent implements OnInit, OnChanges {
  @Input() groups: SidenavGroup[] = [];
  @Input() isCollapsed = false;
  @Input() currentRoute = '';
  @Output() navigationChange = new EventEmitter<SidenavItem>();
  @Output() toggleCollapse = new EventEmitter<void>();

  public expandedGroups = new Set<string>();
  public expandedItems = new Set<string>();
  public searchTerm = '';
  public filteredGroups: SidenavGroup[] = [];

  // Track expanded state when collapsed to restore later
  private expandedGroupsBeforeCollapse = new Set<string>();
  private expandedItemsBeforeCollapse = new Set<string>();

  ngOnInit(): void {
    // Initialize expanded state - only expand groups that have expanded: true
    this.groups.forEach(group => {
      if (group.expanded) {
        this.expandedGroups.add(group.id);
      }
    });

    // Initialize filtered groups
    this.updateFilteredGroups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update filtered groups when input groups change
    if (changes.groups) {
      this.updateFilteredGroups();
    }

    // Handle collapse/expand state changes when isCollapsed changes
    if (changes.isCollapsed) {
      this.handleCollapseStateChange();
    }
  }

  public toggleGroup(groupId: string): void {
    // If sidenav is collapsed, expand it and open this group
    if (this.isCollapsed) {
      this.expandSidenavAndOpenGroup(groupId);
      return;
    }

    // Accordion behavior: close all other groups when opening a new one
    if (this.expandedGroups.has(groupId)) {
      // If clicking the already expanded group, just close it
      this.expandedGroups.delete(groupId);
    } else {
      // Close all other groups and open this one
      this.expandedGroups.clear();
      this.expandedGroups.add(groupId);
    }
  }

  public toggleItem(itemId: string): void {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  public isGroupExpanded(groupId: string): boolean {
    return this.expandedGroups.has(groupId);
  }

  public isItemExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  public onItemClick(item: SidenavItem, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // If item has sub-items, toggle expansion
    if (item.subItems && item.subItems.length > 0 && item.id) {
      this.toggleItem(item.id);
      return;
    }

    // Otherwise, emit navigation change
    this.navigationChange.emit(item);
  }

  public onSubItemClick(subItem: SidenavItem, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.navigationChange.emit(subItem);
  }

  public isActiveRoute(item: SidenavItem): boolean {
    if (!item.route || !item.route[0]) {
      return false;
    }

    // Check if the current route contains the route segment in the tenant-portal outlet
    const routeSegment = item.route[0];

    // Try multiple patterns to match the route
    const patterns = [
      `(tenant-portal:${routeSegment})`, // Outlet format
      `/${routeSegment}`, // Direct path
      routeSegment, // Just the segment
    ];

    const isActive = patterns.some(pattern => this.currentRoute.includes(pattern));

    return isActive;
  }

  /**
   * Check if any item in a group is currently active
   */
  public isGroupActive(group: SidenavGroup): boolean {
    return group.items.some(item => {
      // Check main item
      if (this.isActiveRoute(item)) {
        return true;
      }

      // Check sub-items
      if (item.subItems) {
        return item.subItems.some(subItem => this.isActiveRoute(subItem));
      }

      return false;
    });
  }

  public onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  /**
   * Expand sidenav and open specific group
   */
  private expandSidenavAndOpenGroup(groupId: string): void {
    // For accordion behavior, only open the clicked group
    this.expandedGroups.clear();
    this.expandedGroups.add(groupId);

    // Update the stored state to only include this group
    this.expandedGroupsBeforeCollapse.clear();
    this.expandedGroupsBeforeCollapse.add(groupId);

    // Emit toggle to expand the sidenav
    this.toggleCollapse.emit();
  }

  /**
   * Handle collapse/expand state changes
   */
  private handleCollapseStateChange(): void {
    if (this.isCollapsed) {
      // Store current expanded state before collapsing (but respect accordion - only one group)
      this.expandedGroupsBeforeCollapse = new Set(this.expandedGroups);
      this.expandedItemsBeforeCollapse = new Set(this.expandedItems);

      // Collapse all groups and items
      this.expandedGroups.clear();
      this.expandedItems.clear();
    } else {
      // Restore previously expanded state when expanding (accordion: only one group)
      if (this.expandedGroupsBeforeCollapse.size > 0) {
        // For accordion behavior, only restore the last expanded group
        const lastExpandedGroup = Array.from(this.expandedGroupsBeforeCollapse)[this.expandedGroupsBeforeCollapse.size - 1];
        this.expandedGroups.clear();
        this.expandedGroups.add(lastExpandedGroup);
      }
      if (this.expandedItemsBeforeCollapse.size > 0) {
        this.expandedItems = new Set(this.expandedItemsBeforeCollapse);
      }
    }
  }

  /**
   * Handle search input changes
   */
  public onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.updateFilteredGroups();
  }

  /**
   * Update filtered groups based on search term
   */
  private updateFilteredGroups(): void {
    if (!this.searchTerm.trim()) {
      this.filteredGroups = [...this.groups];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();

    this.filteredGroups = this.groups
      .map(group => {
        // Filter items within each group
        const filteredItems = group.items.filter(item => this.itemMatchesSearch(item, searchLower));

        // Return group only if it has matching items or the group name matches
        if (filteredItems.length > 0 || group.name.toLowerCase().includes(searchLower)) {
          return {
            ...group,
            items: filteredItems.length > 0 ? filteredItems : group.items,
          };
        }
        return null;
      })
      .filter(group => group !== null) as SidenavGroup[];

    // Auto-expand groups that have search results (but maintain accordion behavior)
    if (this.searchTerm.trim()) {
      // For search results, we can show multiple groups expanded
      // But when search is cleared, we should return to accordion behavior
      this.filteredGroups.forEach(group => {
        this.expandedGroups.add(group.id);
      });
    } else {
      // When not searching, maintain accordion behavior - only one group expanded
      if (this.expandedGroups.size > 1) {
        const firstExpanded = Array.from(this.expandedGroups)[0];
        this.expandedGroups.clear();
        this.expandedGroups.add(firstExpanded);
      }
    }
  }

  /**
   * Check if an item matches the search term
   */
  private itemMatchesSearch(item: SidenavItem, searchTerm: string): boolean {
    // Check item name
    if (item.name.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check tooltip if it exists
    if (item.tooltip && item.tooltip.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check sub-items recursively
    if (item.subItems) {
      return item.subItems.some(subItem => this.itemMatchesSearch(subItem, searchTerm));
    }

    return false;
  }
}
