# Tenant Graph Services

## Overview

Collection of services to render graphs in the UI.

## Service Architecture

```
src/app/services/tenant-graph/
├── tenant-graph-core.service.ts          (Orchestrator)
├── tenant-graph-path-trace.service.ts    (PathTrace)
├── tenant-graph-highlight.service.ts     (Visual highlighting)
├── tenant-graph-data.service.ts          (Data transformation)
├── tenant-graph-layout.service.ts        (Layout algorithms)
├── tenant-graph-ui.service.ts            (UI components)
└── tenant-graph-interaction.service.ts   (User interactions)
```

## Service Responsibilities

### 1. **TenantGraphCoreService** (Orchestrator)
- **Purpose**: Main entry point, coordinates all other services
- **API**: Same as original TenantGraphRenderingService
- **Benefits**: Clean migration path, backward compatibility

### 2. **TenantGraphPathTraceService**
- **Purpose**: PathTrace functionality with Dijkstra's algorithm
- **Features**: Optimal path finding, cost calculation, state management
- **Benefits**: Testable algorithms, reusable for other graph types

### 3. **TenantGraphHighlightService**
- **Purpose**: Visual highlighting and dynamic state management
- **Features**: Multi-state rendering, path highlighting, opacity control
- **Benefits**: Centralized visual state, easy to extend

### 4. **TenantGraphDataService**
- **Purpose**: Data transformation and validation
- **Features**: Backend to D3 conversion, relationship mapping, validation
- **Benefits**: Clean data pipeline, reusable transformations

### 5. **TenantGraphLayoutService**
- **Purpose**: Node positioning and layout optimization
- **Features**: Hierarchical positioning, multi-pass optimization, clustering
- **Benefits**: Testable algorithms, performance optimization

### 6. **TenantGraphUIService**
- **Purpose**: UI components and overlays
- **Features**: Tooltips, context menus, legends, PathTrace status box
- **Benefits**: Modular UI, easy customization

### 7. **TenantGraphInteractionService**
- **Purpose**: User interactions and force simulation
- **Features**: Zoom/pan, drag, click handling, D3 physics
- **Benefits**: Isolated interaction logic, configurable behavior
