import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './tabs.component';
import { TooltipModule } from '../tooltip/tooltip.module';

@NgModule({
  imports: [CommonModule, TooltipModule],
  declarations: [TabsComponent],
  exports: [TabsComponent],
})
export class TabsModule {}
