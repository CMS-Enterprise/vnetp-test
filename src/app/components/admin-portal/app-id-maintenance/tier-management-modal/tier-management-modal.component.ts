import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { Tier } from '../../../../../../client';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

export interface TierManagementModalData {
  tenantName: string;
  tiers: Tier[];
}

export interface TierManagementSaveChanges {
  tiersToUpdate: { id: string; appIdEnabled: boolean }[];
}

@Component({
  selector: 'app-tier-management-modal',
  templateUrl: './tier-management-modal.component.html',
  styleUrls: ['./tier-management-modal.component.css'],
})
export class TierManagementModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveChanges = new EventEmitter<TierManagementSaveChanges>();

  tenantName: string;
  allTiers: Tier[] = [];

  initialTierStates = new Map<string, boolean>();
  currentTierStates = new Map<string, boolean>();

  viewMode: 'edit' | 'summary' = 'edit';
  pendingChangesToDisplay: { id: string; name: string; newStatus: boolean; oldStatus: boolean; showDisableWarning?: boolean }[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: TierManagementModalData) {}

  ngOnInit(): void {
    if (this.data) {
      this.tenantName = this.data.tenantName;
      this.initializeTierStates(this.data.tiers || []);
    } else {
      console.error('TierManagementModalComponent: No data received!');
    }
  }

  initializeTierStates(tiers: Tier[]): void {
    this.allTiers = [...tiers].sort((a, b) => a.name.localeCompare(b.name));
    this.initialTierStates.clear();
    this.currentTierStates.clear();
    this.viewMode = 'edit'; // Reset view mode on re-initialization
    this.pendingChangesToDisplay = [];

    this.allTiers.forEach(tier => {
      this.initialTierStates.set(tier.id, tier.appIdEnabled);
      this.currentTierStates.set(tier.id, tier.appIdEnabled);
    });
  }

  toggleTierStatus(tierId: string): void {
    const currentStatus = this.currentTierStates.get(tierId);
    this.currentTierStates.set(tierId, !currentStatus);
  }

  toggleAllTiersStatus(event: MatSlideToggleChange): void {
    const newStatus = event.checked;
    this.allTiers.forEach(tier => {
      this.currentTierStates.set(tier.id, newStatus);
    });
  }

  areAllTiersCurrentlyEnabled(): boolean {
    if (this.allTiers.length === 0) {
      return false; // Or true, depending on desired state for empty list
    }
    for (const tier of this.allTiers) {
      if (!this.currentTierStates.get(tier.id)) {
        return false;
      }
    }
    return true;
  }

  onSaveOrConfirm(): void {
    if (this.viewMode === 'edit') {
      const tiersToUpdate: { id: string; appIdEnabled: boolean }[] = [];
      this.pendingChangesToDisplay = []; // Clear previous summary

      this.currentTierStates.forEach((newStatus, tierId) => {
        const oldStatus = this.initialTierStates.get(tierId);
        if (oldStatus !== newStatus && oldStatus !== undefined) {
          tiersToUpdate.push({ id: tierId, appIdEnabled: newStatus });
          const tierDetails = this.allTiers.find(t => t.id === tierId);
          if (tierDetails) {
            let showWarning = false;
            if (newStatus === false && (tierDetails.appVersion || tierDetails.runtimeDataLastRefreshed)) {
              showWarning = true;
            }
            this.pendingChangesToDisplay.push({
              id: tierId,
              name: tierDetails.name,
              newStatus,
              oldStatus,
              showDisableWarning: showWarning,
            });
          }
        }
      });

      if (tiersToUpdate.length > 0) {
        this.viewMode = 'summary';
      } else {
        // No changes, just close
        this.closeModal.emit();
      }
    } else {
      // viewMode === 'summary'
      const changesToEmit = this.pendingChangesToDisplay.map(ch => ({ id: ch.id, appIdEnabled: ch.newStatus }));
      this.saveChanges.emit({ tiersToUpdate: changesToEmit });
      // Parent component will close the dialog. Reset state for robustness.
      this.viewMode = 'edit';
      this.pendingChangesToDisplay = [];
    }
  }

  onBackToEdit(): void {
    this.viewMode = 'edit';
    this.pendingChangesToDisplay = [];
  }

  onCancel(): void {
    this.viewMode = 'edit'; // Reset view mode
    this.pendingChangesToDisplay = []; // Clear any pending changes
    this.closeModal.emit();
  }

  hasChanges(): boolean {
    for (const [tierId, newStatus] of this.currentTierStates.entries()) {
      if (this.initialTierStates.get(tierId) !== newStatus) {
        return true;
      }
    }
    return false;
  }
}
