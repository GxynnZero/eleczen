import { For, createSignal } from 'solid-js';
import {
  PARTS,
  beginWireEdit,
  cancelWireEdit,
  clearSelection,
  components,
  connectPort,
  connectTerminals,
  deleteItem,
  finishWireEdit,
  remember,
  moveComponent,
  panViewport,
  pendingPort,
  pointsToPath,
  portPoint,
  routeWire,
  selectComponent,
  selectWire,
  selection,
  setZoom,
  settings,
  viewport,
  wireEditTarget,
  wires,
  updateAnchor,
  toggleProbeVariable,
  simulation,
} from '../store/state.js';

const VIEWBOX = { width: 900, height: 560 };
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const isSelected = (type, id) => selection().type === type && selection().id === id;
const isPending = (componentId, portId) => pendingPort()?.componentId === componentId && pendingPort()?.portId === portId;

function PartBody(props) {
  const active = () => props.component.state?.active;

  if (props.component.type === 'battery') {
    return (
      <g class="symbol">
        <line x1="-56" y1="0" x2="-18" y2="0" />
        <line x1="18" y1="0" x2="56" y2="0" />
        <line x1="-18" y1="-26" x2="-18" y2="26" />
        <line x1="6" y1="-16" x2="6" y2="16" />
        <text x="-21" y="-34" class="symbol-text">+</text>
        <text x="3" y="-34" class="symbol-text">-</text>
      </g>
    );
  }

  if (props.component.type === 'led') {
    return (
      <g class={`symbol ${active() ? 'symbol-hot' : ''}`}>
        <line x1="-54" y1="0" x2="-22" y2="0" />
        <line x1="24" y1="0" x2="54" y2="0" />
        <polygon points="-22,-24 -22,24 20,0" />
        <line x1="24" y1="-24" x2="24" y2="24" />
        <line x1="8" y1="-30" x2="25" y2="-47" />
        <line x1="24" y1="-30" x2="41" y2="-47" />
      </g>
    );
  }

  if (props.component.type === 'capacitor') {
    return (
      <g class="symbol">
        <line x1="-54" y1="0" x2="-15" y2="0" />
        <line x1="15" y1="0" x2="54" y2="0" />
        <line x1="-15" y1="-27" x2="-15" y2="27" />
        <line x1="15" y1="-27" x2="15" y2="27" />
      </g>
    );
  }

  if (props.component.type === 'switch') {
    return (
      <g class="symbol">
        <line x1="-54" y1="0" x2="-18" y2="0" />
        <line x1="18" y1="0" x2="54" y2="0" />
        <line x1="-18" y1="0" x2="18" y2="-22" />
        <circle cx="-18" cy="0" r="4" />
        <circle cx="18" cy="0" r="4" />
      </g>
    );
  }

  return (
    <g class="symbol">
      <line x1="-60" y1="0" x2="-38" y2="0" />
      <polyline points="-38,0 -28,-16 -12,16 4,-16 20,16 36,0" />
      <line x1="36" y1="0" x2="60" y2="0" />
    </g>
  );
}

export default function Canvas() {
  let svg;
  const [drag, setDrag] = createSignal(null);
  const [pan, setPan] = createSignal(null);
  const [wireDraft, setWireDraft] = createSignal(null);
  const [probeDraft, setProbeDraft] = createSignal(null);
  const [hoveredComponent, setHoveredComponent] = createSignal(null);
  let suppressClick = false;

  const formatValue = (v, unit) => {
    if (v == null) return '--';
    const abs = Math.abs(v);
    if (abs >= 1) return v.toFixed(2) + ' ' + unit;
    if (abs >= 1e-3) return (v * 1e3).toFixed(2) + ' m' + unit;
    if (abs >= 1e-6) return (v * 1e6).toFixed(2) + ' u' + unit;
    return v.toExponential(2) + ' ' + unit;
  };

  const getSimValue = (name) => {
    const data = simulation()?.engine?.raw?.data;
    if (!data) return null;
    const lowerName = name.toLowerCase();
    const series = data.find(s => s.name.toLowerCase() === lowerName);
    if (!series || !series.values || series.values.length === 0) return null;
    const val = Number(series.values[series.values.length - 1]);
    return Number.isFinite(val) ? val : null;
  };

  const getDeviceName = (component) => {
    const pfx = { battery: 'V', resistor: 'R', led: 'D', capacitor: 'C', switch: 'R' }[component.type] || 'X';
    let name = `${pfx}_${component.id.replace(/\W/g, '_')}`;
    if (component.type === 'switch') name += '_SW';
    return name;
  };

  const screenPointFromEvent = (event) => {
    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEWBOX.width,
      y: ((event.clientY - rect.top) / rect.height) * VIEWBOX.height,
    };
  };

  const pointFromEvent = (event) => {
    const screen = screenPointFromEvent(event);
    const view = viewport();
    return {
      x: (screen.x - view.x) / view.zoom,
      y: (screen.y - view.y) / view.zoom,
    };
  };

  const terminalPoint = (terminal) => {
    const component = components().find((item) => item.id === terminal.componentId);
    return component ? portPoint(component, terminal.portId) : { x: 0, y: 0 };
  };

  const terminalNear = (point, except = null) => {
    let best = null;
    const radius = 18 / viewport().zoom;

    for (const component of components()) {
      for (const port of PARTS[component.type]?.ports || []) {
        if (except?.componentId === component.id && except?.portId === port.id) continue;
        const target = portPoint(component, port.id);
        const distance = Math.hypot(point.x - target.x, point.y - target.y);

        if (distance <= radius && (!best || distance < best.distance)) {
          best = { componentId: component.id, portId: port.id, distance };
        }
      }
    }

    return best ? { componentId: best.componentId, portId: best.portId } : null;
  };

  const startPan = (event) => {
    const screen = screenPointFromEvent(event);
    setPan({ screen, viewport: viewport() });
  };

  const startDrag = (event, component) => {
    if (event.button !== 0) return;
    event.stopPropagation();

    if (settings().tool === 'delete') {
      deleteItem('component', component.id);
      return;
    }

    if (settings().tool === 'probe') {
      const devName = getDeviceName(component);
      toggleProbeVariable(`i(${devName})`);
      return;
    }

    if (settings().tool === 'wire') return;

    svg.setPointerCapture?.(event.pointerId);
    selectComponent(component.id);
    remember();
    const point = pointFromEvent(event);
    setDrag({ type: 'component', id: component.id, dx: point.x - component.x, dy: point.y - component.y });
  };

  const startAnchorDrag = (event, wireId, anchorIndex, anchorPoint) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    svg.setPointerCapture?.(event.pointerId);
    selectWire(wireId);
    const point = pointFromEvent(event);
    setDrag({ type: 'anchor', wireId, anchorIndex, dx: point.x - anchorPoint.x, dy: point.y - anchorPoint.y });
  };

  const dragMove = (event) => {
    const currentPan = pan();
    if (currentPan) {
      const screen = screenPointFromEvent(event);
      panViewport(screen.x - currentPan.screen.x + currentPan.viewport.x - viewport().x, screen.y - currentPan.screen.y + currentPan.viewport.y - viewport().y);
      return;
    }

    const draft = wireDraft();
    if (draft) {
      const point = pointFromEvent(event);
      const distance = Math.hypot(point.x - draft.start.x, point.y - draft.start.y);
      setWireDraft({ ...draft, point, active: draft.active || distance > 6 });
      return;
    }

    const pDraft = probeDraft();
    if (pDraft) {
      const point = pointFromEvent(event);
      const distance = Math.hypot(point.x - pDraft.start.x, point.y - pDraft.start.y);
      setProbeDraft({ ...pDraft, point, active: pDraft.active || distance > 6 });
      return;
    }

    const item = drag();
    if (!item) return;
    const point = pointFromEvent(event);
    if (item.type === 'component') {
      moveComponent(item.id, clamp(point.x - item.dx, 70, VIEWBOX.width - 70), clamp(point.y - item.dy, 60, VIEWBOX.height - 60));
    } else if (item.type === 'anchor') {
      updateAnchor(item.wireId, item.anchorIndex, point.x - item.dx, point.y - item.dy);
    }
  };

  const startWire = (event, component, port) => {
    if (settings().tool === 'delete' || settings().tool === 'wire-edit') return;
    event.stopPropagation();
    const point = portPoint(component, port.id);
    
    if (settings().tool === 'probe') {
      setProbeDraft({ from: { componentId: component.id, portId: port.id }, start: point, point, active: false });
    } else {
      setWireDraft({ from: { componentId: component.id, portId: port.id }, start: point, point, anchors: [], active: false });
    }
  };

  const stopPointer = (event) => {
    const draft = wireDraft();
    if (draft?.active) {
      const target = terminalNear(pointFromEvent(event), draft.from);
      if (target) connectTerminals(draft.from, target, draft.anchors || []);
      suppressClick = true;
      requestAnimationFrame(() => {
        suppressClick = false;
      });
    }

    const pDraft = probeDraft();
    if (pDraft) {
      if (pDraft.active) {
        const target = terminalNear(pointFromEvent(event), pDraft.from);
        if (target) {
            const n1 = simulation()?.nodeMap?.get(`${pDraft.from.componentId}_${pDraft.from.portId}`);
            const n2 = simulation()?.nodeMap?.get(`${target.componentId}_${target.portId}`);
            if (n1 && n2) {
                toggleProbeVariable(`v(${n1}, ${n2})`);
            }
        }
      } else {
        const n1 = simulation()?.nodeMap?.get(`${pDraft.from.componentId}_${pDraft.from.portId}`);
        if (n1) {
            toggleProbeVariable(`v(${n1})`);
        }
      }
      suppressClick = true;
      requestAnimationFrame(() => {
        suppressClick = false;
      });
    }

    setWireDraft(null);
    setProbeDraft(null);
    setDrag(null);
    setPan(null);
  };

  const wirePath = (wire) => {
    const start = terminalPoint(wire.from);
    const end = terminalPoint(wire.to);
    const points = settings().routing === 'straight'
      ? [start, end]
      : routeWire(start, end, components(), { from: wire.from, to: wire.to, anchors: wire.anchors || [] });
    return pointsToPath(points);
  };

  const draftPath = () => {
    const draft = wireDraft();
    if (!draft) return '';
    const points = settings().routing === 'straight'
      ? [draft.start, draft.point]
      : routeWire(draft.start, draft.point, components(), { from: draft.from, anchors: draft.anchors || [] });
    return pointsToPath(points);
  };

  return (
    <div class="canvas-shell">
      <svg
        ref={svg}
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        class={`board ${settings().tool === 'probe' ? 'probe-cursor' : ''}`}
        onWheel={(event) => {
          event.preventDefault();
          const direction = event.deltaY > 0 ? -0.1 : 0.1;
          setZoom(viewport().zoom + direction);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          const draft = wireDraft();
          if (draft?.active) {
            const pt = pointFromEvent(event);
            setWireDraft({ ...draft, anchors: [...(draft.anchors || []), pt] });
          }
        }}
        onPointerMove={dragMove}
        onPointerUp={stopPointer}
        onPointerLeave={stopPointer}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          clearSelection();
          if (settings().tool === 'select' || settings().tool === 'pan') {
            startPan(event);
            return;
          }
          if (settings().tool === 'wire-edit') {
            cancelWireEdit();
          }
        }}
      >
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" class="grid-line" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="900" height="560" class="board-bg" />
        {settings().grid && <rect width="900" height="560" fill="url(#grid)" />}

        <g transform={`translate(${viewport().x} ${viewport().y}) scale(${viewport().zoom})`}>
          <For each={wires()}>
            {(wire) => {
              const editing = wireEditTarget()?.wireId === wire.id;
              return (
                <g>
                  <path
                    d={wirePath(wire)}
                    class={`wire ${isSelected('wire', wire.id) ? 'selected' : ''} ${editing ? 'editing' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (settings().tool === 'delete') {
                        deleteItem('wire', wire.id);
                        return;
                      }
                      if (settings().tool === 'probe') {
                        const n1 = simulation()?.nodeMap?.get(`${wire.from.componentId}_${wire.from.portId}`);
                        if (n1) toggleProbeVariable(`v(${n1})`);
                        return;
                      }
                      if (settings().tool === 'wire-edit') {
                        selectWire(wire.id);
                        const clickPoint = pointFromEvent(event);
                        const fromPoint = terminalPoint(wire.from);
                        const toPoint = terminalPoint(wire.to);
                        const endpoint = Math.hypot(clickPoint.x - fromPoint.x, clickPoint.y - fromPoint.y) <= Math.hypot(clickPoint.x - toPoint.x, clickPoint.y - toPoint.y) ? 'from' : 'to';
                        beginWireEdit(wire.id, endpoint);
                        return;
                      }
                      selectWire(wire.id);
                    }}
                    onContextMenu={(event) => {
                       // if not in draft, right click on existing wire can add an anchor segment point
                       event.preventDefault();
                       event.stopPropagation();
                       const clickPoint = pointFromEvent(event);
                       const anchors = [...(wire.anchors || []), clickPoint];
                       // We need a helper to addAnchor, or just update the wire via remember/setWires.
                       // For simplicity, we can just use updateAnchor with a new index
                       updateAnchor(wire.id, anchors.length - 1, clickPoint.x, clickPoint.y);
                    }}
                  />
                  {isSelected('wire', wire.id) && (wire.anchors || []).map((anchor, i) => (
                    <circle
                      cx={anchor.x}
                      cy={anchor.y}
                      r="6"
                      class="wire-anchor"
                      fill="#3b82f6"
                      stroke="#000"
                      stroke-width="2"
                      onPointerDown={(event) => startAnchorDrag(event, wire.id, i, anchor)}
                    />
                  ))}
                </g>
              );
            }}
          </For>

          {wireDraft()?.active && <path d={draftPath()} class="wire draft" />}

          <Show when={probeDraft()}>
              {(draft) => (
                  <line 
                      x1={draft().start.x} y1={draft().start.y} 
                      x2={draft().point.x} y2={draft().point.y} 
                      stroke="#eab308" stroke-width="2" stroke-dasharray="4" fill="none"
                  />
              )}
          </Show>

          <For each={components()}>
            {(component) => {
              const spec = PARTS[component.type];

              return (
                  <g
                    class={`part ${isSelected('component', component.id) ? 'selected' : ''} ${component.state?.active ? 'active' : ''}`}
                    transform={`translate(${component.x} ${component.y}) rotate(${component.rotation || 0}) scale(${component.mirror ? -1 : 1}, 1)`}
                    onPointerDown={(event) => startDrag(event, component)}
                    onPointerEnter={() => setHoveredComponent(component.id)}
                    onPointerLeave={() => setHoveredComponent(null)}
                  >
                    <rect x="-78" y="-50" width="156" height="100" rx="8" class="hitbox" />
                    <PartBody component={component} />
                    {settings().showLabels && <text x="0" y="45" class="part-label" transform={component.mirror ? "scale(-1, 1)" : ""}>{spec.label}</text>}
                    
                    <Show when={settings().tool === 'probe' && hoveredComponent() === component.id}>
                      <text x="0" y="-45" class="probe-tooltip" fill="#eab308" font-size="12" font-family="monospace" text-anchor="middle" pointer-events="none" transform={component.mirror ? "scale(-1, 1)" : ""}>
                        {formatValue(getSimValue(`i(${getDeviceName(component)})`), 'A')}
                      </text>
                    </Show>

                  <For each={spec.ports}>
                    {(port) => (
                      <g
                        class={`port ${isPending(component.id, port.id) ? 'pending' : ''}`}
                        transform={`translate(${port.x} ${port.y})`}
                        onPointerDown={(event) => startWire(event, component, port)}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (suppressClick) return;
                          if (settings().tool === 'delete') return;
                          if (settings().tool === 'wire-edit' && wireEditTarget()) {
                            finishWireEdit(component.id, port.id);
                            return;
                          }
                          connectPort(component.id, port.id);
                        }}
                      >
                        <circle r="8" />
                        {settings().showLabels && <text y="-13">{port.label}</text>}
                      </g>
                    )}
                  </For>
                </g>
              );
            }}
          </For>
        </g>
      </svg>
    </div>
  );
}
