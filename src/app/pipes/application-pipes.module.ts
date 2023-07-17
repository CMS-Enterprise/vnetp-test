import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterPipe } from './filter.pipe';
import { ResolvePipe } from './resolve.pipe';
import { SortPipe } from './sort.pipe';

@NgModule({
  declarations: [FilterPipe, ResolvePipe, SortPipe],
  imports: [CommonModule],
  exports: [FilterPipe, ResolvePipe, SortPipe],
})
export class ApplicationPipesModule {}
