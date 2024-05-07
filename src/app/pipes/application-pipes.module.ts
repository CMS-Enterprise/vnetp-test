import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterPipe } from './filter.pipe';
import { ResolvePipe } from './resolve.pipe';
import { SortPipe } from './sort.pipe';
import { SortVirtualServersByStatusPipe } from './sort-servers-by-status.pipe';

@NgModule({
  declarations: [FilterPipe, ResolvePipe, SortPipe, SortVirtualServersByStatusPipe],
  imports: [CommonModule],
  exports: [FilterPipe, ResolvePipe, SortPipe, SortVirtualServersByStatusPipe],
})
export class ApplicationPipesModule {}
