import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { F5ConfigService } from '../f5-config.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-f5-config-filter',
  templateUrl: './f5-config-filter.component.html',
  styleUrls: ['./f5-config-filter.component.css'],
})
export class F5ConfigFilterComponent implements OnInit {
  searchQuery = '';
  selectedPartition: string;
  partitions: string[] = ['[ALL]'];
  showDropdown = false;
  @Input() showPartitionFilter = true;
  partitionNames: string[];
  @Output() partitionSelected = new EventEmitter<string>();
  @Output() f5ConfigSearch = new EventEmitter<string>();

  f5ConfigSubscription: Subscription;
  f5Config: any;
  partitionInfo: any;

  constructor(private f5ConfigStateManagementService: F5ConfigService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.selectedPartition = this.partitions[0];

    this.route.params.subscribe(params => {
      const urlF5Id = params?.id;
      this.f5ConfigStateManagementService.getF5Configs().subscribe(data => {
        this.f5Config = data.find(f5 => f5?.id === urlF5Id);
        if (this.f5Config) {
          this.partitionInfo = this.f5Config.data?.partitionInfo;
          this.partitionInfo = this.partitionInfo === undefined ? {} : this.partitionInfo;
          this.partitionNames = Object.keys(this.partitionInfo);
          this.partitions.push(...this.partitionNames);
        }
      });
    });
  }

  onSearch(): void {
    this.f5ConfigSearch.emit(this.searchQuery);
  }

  selectPartition(partition: string): void {
    this.selectedPartition = partition;
    this.toggleDropdown();
    this.partitionSelected.emit(partition);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement; // Cast to HTMLElement
    if (!clickedElement.closest('.custom-dropdown')) {
      this.showDropdown = false;
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
}
