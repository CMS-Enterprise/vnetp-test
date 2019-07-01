import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3GraphComponent } from 'src/app/components/d3-graph/d3-graph.component';

@NgModule({
  declarations: [
    D3GraphComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    D3GraphComponent
  ]
})
export class GraphModule { }
