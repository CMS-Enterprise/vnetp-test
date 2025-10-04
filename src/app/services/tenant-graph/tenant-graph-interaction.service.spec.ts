/* eslint-disable */
import { TenantGraphInteractionService } from './tenant-graph-interaction.service';

// Mock d3 with minimal behaviors needed for interaction service
const handlers: any = { zoom: {}, drag: {}, bodyClick: null, tick: null };

const mockZoom: any = (selection?: any) => {};
mockZoom.scaleExtent = jest.fn(() => mockZoom);
mockZoom.on = jest.fn((evt: string, cb: any) => {
  handlers.zoom[evt] = cb;
  return mockZoom;
});

const mockDrag: any = (selection?: any) => {};
mockDrag.on = jest.fn((evt: string, cb: any) => {
  handlers.drag[evt] = cb;
  return mockDrag;
});

const mockSimulation = () => {
  const sim: any = {
    force: jest.fn().mockReturnThis(),
    on: jest.fn((evt: string, cb: any) => {
      if (evt === 'tick') handlers.tick = cb;
      return sim;
    }),
  };
  return sim;
};

jest.mock('d3', () => {
  return {
    zoom: jest.fn(() => mockZoom),
    drag: jest.fn(() => mockDrag),
    forceSimulation: jest.fn(() => mockSimulation()),
    forceLink: jest.fn(() => ({
      id: jest.fn().mockReturnThis(),
      distance: jest.fn().mockReturnThis(),
      strength: jest.fn().mockReturnThis(),
    })),
    forceY: jest.fn(() => ({ strength: jest.fn().mockReturnThis() })),
    forceX: jest.fn(() => ({ strength: jest.fn().mockReturnThis() })),
    forceCenter: jest.fn(() => ({ strength: jest.fn().mockReturnThis() })),
    forceManyBody: jest.fn(() => ({ strength: jest.fn().mockReturnThis() })),
    forceCollide: jest.fn(() => ({ iterations: jest.fn().mockReturnThis() })),
    select: jest.fn((sel: any) => {
      if (sel === 'body') {
        return { on: jest.fn((evt: string, cb: any) => (handlers.bodyClick = cb)) };
      }
      return { attr: jest.fn().mockReturnThis() };
    }),
  } as any;
});

function createSelection() {
  const events: any = {};
  const selection: any = {
    on: jest.fn((evt: string, cb: any) => {
      events[evt] = cb;
      return selection;
    }),
    call: jest.fn((fn: any) => {
      if (typeof fn === 'function') {
        fn(selection);
      }
      return selection;
    }),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    html: jest.fn().mockReturnThis(),
    _events: events,
  } as any;
  return selection;
}

function createContextMenuSelection() {
  const appended: any[] = [];
  const api: any = {
    selectAll: jest.fn(() => ({ remove: jest.fn() })),
    append: jest.fn(() => {
      const item: any = {
        style: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        on: jest.fn(function () {
          return this;
        }),
      };
      appended.push(item);
      return item;
    }),
    style: jest.fn().mockReturnThis(),
    _appended: appended,
  };
  return api;
}

describe('TenantGraphInteractionService', () => {
  let service: TenantGraphInteractionService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    service = new TenantGraphInteractionService();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('setupZoom wires zoom with extent and zoom handler', () => {
    const svg = createSelection();
    const zoomGroup = { attr: jest.fn() } as any;
    service.setupZoom(svg as any, zoomGroup, [0.25, 2]);
    expect(svg.call).toHaveBeenCalled();
    expect(mockZoom.scaleExtent).toHaveBeenCalledWith([0.25, 2]);
    expect(mockZoom.on).toHaveBeenCalledWith('zoom', expect.any(Function));
    // simulate zoom event
    handlers.zoom['zoom']?.({ transform: 't(1,2)' });
    expect(zoomGroup.attr).toHaveBeenCalledWith('transform', 't(1,2)');
  });

  it('setupDrag sets fx/fy and interacts with simulation on start/drag/end', () => {
    const nodeSel: any = createSelection();
    const yForType = (t: string) => (t === 'A' ? 100 : 200);
    service.setupDrag(nodeSel, yForType, 300);
    expect(nodeSel.call).toHaveBeenCalled();
    const sim = { alphaTarget: jest.fn(() => sim), restart: jest.fn() } as any;
    const node: any = { type: 'A', simulation: sim };
    handlers.drag['start']?.({ active: false, x: 10 }, node);
    expect(sim.alphaTarget).toHaveBeenCalledWith(0.3);
    expect(sim.restart).toHaveBeenCalled();
    expect(node.fx).toBeGreaterThanOrEqual(20);
    expect(node.fy).toBe(100);
    handlers.drag['drag']?.({ x: 400 }, node);
    expect(node.fx).toBeLessThanOrEqual(280); // width - 20 clamp
    expect(node.fy).toBe(100);
    handlers.drag['end']?.({ active: false }, node);
    expect(sim.alphaTarget).toHaveBeenCalledWith(0);
    expect(node.fx).toBeNull();
    expect(node.fy).toBeNull();
  });

  it('setupForceSimulation hierarchical clamps y and updates selections on tick', () => {
    const nodes: any[] = [
      { id: 'n1', name: 'A', type: 'T', x: 10, y: 10 },
      { id: 'n2', name: 'B', type: 'T', x: 50, y: 50 },
    ];
    const links: any[] = [{ source: nodes[0], target: nodes[1] }];
    const linkSel: any = { attr: jest.fn().mockReturnThis() };
    const nodeSel: any = { attr: jest.fn().mockReturnThis() };
    const yForType = () => 123;
    service.setupForceSimulation(nodes, links, linkSel, nodeSel, yForType, 400, 300, new Map(), {}, 'hierarchical');
    expect(typeof handlers.tick).toBe('function');
    handlers.tick();
    expect(nodes[0].y).toBe(123);
    expect(nodeSel.attr).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
    expect(linkSel.attr).toHaveBeenCalledWith('d', expect.any(Function));
  });

  it('setupForceSimulation circular/force-directed keep within bounds', () => {
    const baseNodes = [
      { id: 'n1', name: 'A', type: 'T', x: 5, y: 5, clusterY: 50, clusterX: 50 },
      { id: 'n2', name: 'B', type: 'T', x: 1000, y: 1000, clusterY: 60, clusterX: 60 },
    ];
    const yForType = () => 10;
    const linkSel: any = { attr: jest.fn().mockReturnThis() };
    const nodeSel: any = { attr: jest.fn().mockReturnThis() };
    // circular
    handlers.tick = null;
    service.setupForceSimulation(
      JSON.parse(JSON.stringify(baseNodes)),
      [],
      linkSel,
      nodeSel,
      yForType,
      200,
      150,
      new Map(),
      {},
      'circular',
    );
    handlers.tick();
    // force-directed
    handlers.tick = null;
    const nodesFD = JSON.parse(JSON.stringify(baseNodes));
    service.setupForceSimulation(nodesFD, [], linkSel, nodeSel, yForType, 200, 150, new Map(), {}, 'force-directed');
    handlers.tick();
    nodesFD.forEach(n => {
      expect(n.x).toBeGreaterThanOrEqual(20);
      expect(n.x).toBeLessThanOrEqual(180);
      expect(n.y).toBeGreaterThanOrEqual(20);
      expect(n.y).toBeLessThanOrEqual(130);
    });
  });

  it('setupTooltipInteractions shows, moves, and hides tooltip with delay', () => {
    const sel: any = createSelection();
    const tooltipCalls: any[] = [];
    const tooltip: any = {
      html: jest.fn().mockReturnThis(),
      style: jest.fn((prop: string, val?: any) => {
        if (val === undefined && prop === 'visibility') {
          return 'visible';
        }
        tooltipCalls.push([prop, val]);
        return tooltip;
      }),
    } as any;
    const fmt = (d: any) => `N:${d.id}`;
    service.setupTooltipInteractions(sel, tooltip, fmt, 200);
    const over = sel._events['mouseover'];
    const out = sel._events['mouseout'];
    const move = sel._events['mousemove'];
    over({ pageX: 10, pageY: 20 }, { id: '1' });
    jest.advanceTimersByTime(199);
    expect(tooltip.style).not.toHaveBeenCalledWith('visibility', 'visible');
    jest.advanceTimersByTime(1);
    expect(tooltip.html).toHaveBeenCalledWith('N:1');
    expect(tooltip.style).toHaveBeenCalledWith('visibility', 'visible');
    move({ pageX: 30, pageY: 40 });
    // move handler offsets: left = pageX + 10, top = pageY - 10
    // Assert move update occurred with expected offsets
    expect(tooltipCalls.some(([p, v]) => p === 'left' && v === '40px')).toBe(true);
    expect(tooltipCalls.some(([p, v]) => p === 'top' && v === '30px')).toBe(true);
    out();
    expect(tooltip.style).toHaveBeenCalledWith('visibility', 'hidden');
  });

  it('setupContextMenuInteractions hides tooltip and noops when no items, then shows when items exist', () => {
    const sel: any = createSelection();
    const tooltip: any = { style: jest.fn().mockReturnThis() };
    const contextMenu: any = createContextMenuSelection();
    const getMenu = jest.fn().mockReturnValue([]);
    const onClick = jest.fn();
    (service as any).showContextMenu = jest.fn();
    service.setupContextMenuInteractions(sel, tooltip, contextMenu, getMenu, onClick);
    sel._events['contextmenu']({ preventDefault: jest.fn(), pageX: 1, pageY: 2 }, { id: 'n' });
    expect(tooltip.style).toHaveBeenCalledWith('visibility', 'hidden');
    expect((service as any).showContextMenu).not.toHaveBeenCalled();
    // With items
    getMenu.mockReturnValue([{ type: 'item', name: 'A', identifier: 'a' }]);
    sel._events['contextmenu']({ preventDefault: jest.fn(), pageX: 3, pageY: 4 }, { id: 'n' });
    expect((service as any).showContextMenu).toHaveBeenCalled();
  });

  it('setupTooltipInteractions mousemove ignored when tooltip not visible', () => {
    const sel: any = createSelection();
    const tooltip: any = {
      html: jest.fn().mockReturnThis(),
      style: jest.fn((prop: string, val?: any) => {
        if (val === undefined && prop === 'visibility') {
          return 'hidden';
        }
        return tooltip;
      }),
    } as any;
    const fmt = (d: any) => `N:${d.id}`;
    service.setupTooltipInteractions(sel, tooltip, fmt, 50);
    const move = sel._events['mousemove'];
    move({ pageX: 10, pageY: 10 });
    // No left/top updates since tooltip is hidden
    expect(tooltip.style).not.toHaveBeenCalledWith('left', expect.any(String));
    expect(tooltip.style).not.toHaveBeenCalledWith('top', expect.any(String));
  });

  it('setupTooltipInteractions cancels previous hover and only shows latest tooltip', () => {
    const sel: any = createSelection();
    const tooltip: any = { html: jest.fn().mockReturnThis(), style: jest.fn().mockReturnThis() };
    const fmt = (d: any) => `N:${d.id}`;
    service.setupTooltipInteractions(sel, tooltip, fmt, 100);
    const over = sel._events['mouseover'];
    // First hover
    over({ pageX: 10, pageY: 20 }, { id: 'first' });
    jest.advanceTimersByTime(50);
    // Second hover before first delay completes
    over({ pageX: 15, pageY: 25 }, { id: 'second' });
    // Advance to trigger only the second tooltip
    jest.advanceTimersByTime(100);
    expect(tooltip.html).toHaveBeenCalledTimes(1);
    expect(tooltip.html).toHaveBeenCalledWith('N:second');
  });

  it('setupDrag active=true branch coverage (no alpha changes)', () => {
    const nodeSel: any = createSelection();
    service.setupDrag(nodeSel, () => 10, 200);
    const sim = { alphaTarget: jest.fn(() => sim), restart: jest.fn() } as any;
    const node: any = { type: 'T', simulation: sim };
    handlers.drag['start']?.({ active: true, x: 10 }, node);
    handlers.drag['end']?.({ active: true }, node);
    expect(sim.alphaTarget).not.toHaveBeenCalledWith(0.3);
    expect(sim.alphaTarget).not.toHaveBeenCalledWith(0);
  });

  it('setupClickInteractions binds click only when handler provided', () => {
    const sel: any = createSelection();
    service.setupClickInteractions(sel);
    expect(sel.on).not.toHaveBeenCalledWith('click', expect.any(Function));
    const sel2: any = createSelection();
    const clicked = jest.fn();
    service.setupClickInteractions(sel2, clicked);
    sel2._events['click']({}, { id: 'n' });
    expect(clicked).toHaveBeenCalledWith({ id: 'n' });
  });

  it('setupGlobalClickHandler hides context menu on body click', () => {
    const contextMenu: any = { style: jest.fn().mockReturnThis() };
    service.setupGlobalClickHandler(contextMenu);
    // simulate body click via mock handler
    handlers.bodyClick?.();
    expect(contextMenu.style).toHaveBeenCalledWith('visibility', 'hidden');
  });

  it('setupEdgeHoverInteractions highlights edge, shows tooltip after delay, resets on mouseout, updates on move', () => {
    const linkSel: any = createSelection();
    const tooltip: any = {
      html: jest.fn().mockReturnThis(),
      style: jest.fn((prop: string, val?: any) => {
        if (val === undefined && prop === 'visibility') {
          return 'visible';
        }
        return tooltip;
      }),
    } as any;
    const fmt = (d: any) => `E:${d.id}`;
    const edgeStyles: any = {
      VRF_TO_L3OUT: { color: '#000', dasharray: '0', width: 2, opacity: 0.5 },
      INTERVRF_CONNECTION: { color: '#f00', dasharray: '4,2', width: 3, opacity: 0.8 },
    };
    // Event target selection
    const attrSpy = jest.fn().mockReturnThis();
    const d3 = require('d3');
    (d3.select as any).mockImplementation((t: any) => ({ attr: attrSpy }));
    service.setupEdgeHoverInteractions(linkSel, tooltip, fmt, edgeStyles, 2);
    const over = linkSel._events['mouseover'];
    const out = linkSel._events['mouseout'];
    const move = linkSel._events['mousemove'];
    const evt: any = { target: {}, pageX: 10, pageY: 20 };
    const datum: any = { id: 'e1', type: 'INTERVRF_CONNECTION' };
    over(evt, datum);
    expect(attrSpy).toHaveBeenCalledWith('stroke-width', expect.any(Function));
    expect(attrSpy).toHaveBeenCalledWith('stroke-opacity', 1);
    jest.advanceTimersByTime(499);
    expect(tooltip.style).not.toHaveBeenCalledWith('visibility', 'visible');
    jest.advanceTimersByTime(1);
    expect(tooltip.html).toHaveBeenCalledWith('E:e1');
    expect(tooltip.style).toHaveBeenCalledWith('visibility', 'visible');
    move({ pageX: 30, pageY: 40 });
    // move handler offsets: left = pageX + 10, top = pageY - 10
    expect(tooltip.style).toHaveBeenCalledWith('left', '40px');
    expect(tooltip.style).toHaveBeenCalledWith('top', '30px');
    out(evt);
    expect(tooltip.style).toHaveBeenCalledWith('visibility', 'hidden');
    expect(attrSpy).toHaveBeenCalledWith('stroke-width', expect.any(Function));
    expect(attrSpy).toHaveBeenCalledWith('stroke-opacity', expect.any(Function));
  });

  it('setupEdgeHoverInteractions uses fallback style and default width when type unknown', () => {
    const linkSel: any = createSelection();
    const tooltip: any = {
      html: jest.fn().mockReturnThis(),
      style: jest.fn((prop: string, val?: any) => {
        if (val === undefined && prop === 'visibility') {
          return 'visible';
        }
        return tooltip;
      }),
    } as any;
    const fmt = (d: any) => `E:${d.id}`;
    const edgeStyles: any = {
      VRF_TO_L3OUT: { color: '#000', dasharray: '0', width: 2, opacity: 0.5 },
    };
    const attrSpy = jest.fn().mockReturnThis();
    const d3 = require('d3');
    (d3.select as any).mockImplementation((t: any) => ({ attr: attrSpy }));
    // Use default defaultEdgeWidth (1) by omitting the param
    (service as any).setupEdgeHoverInteractions(linkSel, tooltip, fmt, edgeStyles);
    const over = linkSel._events['mouseover'];
    const out = linkSel._events['mouseout'];
    const evt: any = { target: {}, pageX: 5, pageY: 5 };
    over(evt, { id: 'e2', type: 'UNKNOWN' });
    // Capture the width function used on mouseover
    const widthFn = attrSpy.mock.calls.find((c: any) => c[0] === 'stroke-width' && typeof c[1] === 'function')?.[1];
    expect(typeof widthFn).toBe('function');
    // Fallback width: VRF_TO_L3OUT.width (2) * defaultEdgeWidth (1) + 1 = 3
    expect(widthFn({ type: 'UNKNOWN' })).toBe(3);
    out(evt);
    // Capture reset width and opacity functions on mouseout
    const resetWidthFn = attrSpy.mock.calls.reverse().find((c: any) => c[0] === 'stroke-width' && typeof c[1] === 'function')?.[1];
    const resetOpacityFn = attrSpy.mock.calls.find((c: any) => c[0] === 'stroke-opacity' && typeof c[1] === 'function')?.[1];
    expect(resetWidthFn({ type: 'UNKNOWN' })).toBe(2); // VRF_TO_L3OUT.width (2) * defaultEdgeWidth (1)
    expect(resetOpacityFn({ type: 'UNKNOWN' })).toBe(0.5); // VRF_TO_L3OUT.opacity
  });

  it('setupEdgeHoverInteractions does not move tooltip when hidden on mousemove', () => {
    const linkSel: any = createSelection();
    const tooltip: any = {
      html: jest.fn().mockReturnThis(),
      style: jest.fn((prop: string, val?: any) => {
        if (val === undefined && prop === 'visibility') {
          return 'hidden';
        }
        return tooltip;
      }),
    } as any;
    const fmt = (d: any) => `E:${d.id}`;
    const edgeStyles: any = { VRF_TO_L3OUT: { color: '#000', dasharray: '0', width: 2, opacity: 0.5 } };
    const d3 = require('d3');
    (d3.select as any).mockImplementation((t: any) => ({ attr: jest.fn().mockReturnThis() }));
    service.setupEdgeHoverInteractions(linkSel, tooltip, fmt, edgeStyles, 2);
    const move = linkSel._events['mousemove'];
    move({ pageX: 99, pageY: 88 });
    expect(tooltip.style).not.toHaveBeenCalledWith('left', expect.any(String));
    expect(tooltip.style).not.toHaveBeenCalledWith('top', expect.any(String));
  });

  it('setupEdgeHoverInteractions computes width with provided defaultEdgeWidth', () => {
    const linkSel: any = createSelection();
    const tooltip: any = {
      html: jest.fn().mockReturnThis(),
      style: jest.fn((prop: string, val?: any) => {
        if (val === undefined && prop === 'visibility') {
          return 'visible';
        }
        return tooltip;
      }),
    } as any;
    const fmt = (d: any) => `E:${d.id}`;
    const edgeStyles: any = { VRF_TO_L3OUT: { color: '#000', dasharray: '0', width: 3, opacity: 0.6 } };
    const attrSpy = jest.fn().mockReturnThis();
    const d3 = require('d3');
    (d3.select as any).mockImplementation((t: any) => ({ attr: attrSpy }));
    service.setupEdgeHoverInteractions(linkSel, tooltip, fmt, edgeStyles, 2);
    const over = linkSel._events['mouseover'];
    const out = linkSel._events['mouseout'];
    const evt: any = { target: {}, pageX: 0, pageY: 0 };
    over(evt, { id: 'e3', type: 'UNKNOWN' });
    const widthFn = attrSpy.mock.calls.find((c: any) => c[0] === 'stroke-width' && typeof c[1] === 'function')?.[1];
    expect(widthFn({ type: 'UNKNOWN' })).toBe(3 * 2 + 1); // 7
    out(evt);
    const resetWidthFn = attrSpy.mock.calls.reverse().find((c: any) => c[0] === 'stroke-width' && typeof c[1] === 'function')?.[1];
    expect(resetWidthFn({ type: 'UNKNOWN' })).toBe(3 * 2); // 6
  });

  it('setupForceSimulation circular uses fallback y when clusterY undefined on a node', () => {
    const nodes: any[] = [
      { id: 'n1', name: 'Short', type: 'T', x: 10, y: 10, clusterY: 40, clusterX: 40 },
      { id: 'n2', name: 'VeryVeryVeryVeryVeryVeryLongNameForCollisionBranch', type: 'T', x: 190, y: 140, clusterX: 60 },
    ];
    const links: any[] = [];
    const linkSel: any = { attr: jest.fn().mockReturnThis() };
    const nodeSel: any = { attr: jest.fn().mockReturnThis() };
    const yForType = () => 77;
    handlers.tick = null;
    service.setupForceSimulation(nodes, links, linkSel, nodeSel, yForType, 200, 150, new Map(), {}, 'circular');
    handlers.tick();
    // Node with clusterY should be near its clusterY; the other should be clamped within bounds and not equal to 77 necessarily
    expect(nodes[0].y).toBeDefined();
    expect(nodes[1].y).toBeGreaterThanOrEqual(20);
    expect(nodes[1].y).toBeLessThanOrEqual(130);
  });

  it('setupForceSimulation configures forceLink id/distance/strength', () => {
    const d3 = require('d3');
    const linkSpyObj = {
      id: jest.fn().mockReturnThis(),
      distance: jest.fn().mockReturnThis(),
      strength: jest.fn().mockReturnThis(),
    };
    (d3.forceLink as jest.Mock).mockImplementation(() => linkSpyObj);

    const nodes: any[] = [
      { id: 'x', name: 'X', type: 'T', x: 10, y: 10, clusterX: 50 },
      { id: 'y', name: 'Y', type: 'T', x: 50, y: 50, clusterX: 60 },
    ];
    const links: any[] = [{ source: nodes[0], target: nodes[1] }];
    const linkSel: any = { attr: jest.fn().mockReturnThis() };
    const nodeSel: any = { attr: jest.fn().mockReturnThis() };
    service.setupForceSimulation(nodes, links, linkSel, nodeSel, () => 10, 200, 150, new Map(), {}, 'hierarchical');
    expect(linkSpyObj.id).toHaveBeenCalled();
    expect(linkSpyObj.distance).toHaveBeenCalled();
    expect(linkSpyObj.strength).toHaveBeenCalled();
  });

  it('link path generator covers sign branches for dx/dy and indexOffset', () => {
    const nodes: any[] = [
      { id: 'a', name: 'A', type: 'T', x: 10, y: 20, clusterX: 40 },
      { id: 'b', name: 'B', type: 'T', x: 80, y: 100, clusterX: 60 },
    ];
    const links: any[] = [{ source: nodes[0], target: nodes[1] }];
    const linkSel: any = { attr: jest.fn().mockReturnThis() };
    const nodeSel: any = { attr: jest.fn().mockReturnThis() };
    service.setupForceSimulation(nodes, links, linkSel, nodeSel, () => 10, 200, 150, new Map(), {}, 'hierarchical');
    // trigger tick so the link path generator is wired
    handlers.tick();
    const dCall = linkSel.attr.mock.calls.filter((c: any) => c[0] === 'd').pop();
    expect(dCall).toBeDefined();
    const pathFn = dCall[1];
    // Case 1: x1<x2 and y2>y1
    const d1 = { source: { x: 10, y: 20 }, target: { x: 80, y: 100 } };
    const p1 = pathFn(d1);
    expect(p1).toContain('Q');
    // Case 2: x1>x2
    const d2 = { source: { x: 80, y: 20 }, target: { x: 10, y: 100 } };
    const p2 = pathFn(d2);
    expect(p2).toContain('Q');
    // Case 3: y2<y1
    const d3 = { source: { x: 10, y: 100 }, target: { x: 80, y: 20 } };
    const p3 = pathFn(d3);
    expect(p3).toContain('Q');
  });

  it('showContextMenu renders dividers and items, respects disabled, and invokes click', () => {
    const contextMenu: any = createContextMenuSelection();
    const onClick = jest.fn();
    const items = [
      { type: 'divider' },
      { type: 'item', name: 'Disabled', identifier: 'x', enabled: false },
      { type: 'item', name: 'Enabled', identifier: 'y', enabled: true },
    ];
    (service as any).showContextMenu(contextMenu, 10, 20, { id: 'n' }, items, onClick);
    expect(contextMenu.selectAll).toHaveBeenCalled();
    expect(contextMenu._appended.length).toBe(3);
    // disabled item should not wire click
    const disabled = contextMenu._appended[1];
    expect(disabled.on.mock.calls.find((c: any) => c[0] === 'click')).toBeUndefined();
    // simulate click on enabled item
    const enabled = contextMenu._appended[2];
    const clickHandler = enabled.on.mock.calls.find((c: any) => c[0] === 'click')[1];
    clickHandler({ stopPropagation: jest.fn() });
    expect(onClick).toHaveBeenCalledWith('y', { id: 'n' });
    expect(contextMenu.style).toHaveBeenCalledWith('left', '10px');
    expect(contextMenu.style).toHaveBeenCalledWith('top', '20px');
    expect(contextMenu.style).toHaveBeenCalledWith('visibility', 'visible');
  });

  it('getDefaultForceConfig returns a copy', () => {
    const cfg = service.getDefaultForceConfig();
    cfg.linkDistance = 999;
    const cfg2 = service.getDefaultForceConfig();
    expect(cfg2.linkDistance).not.toBe(999);
  });
});
