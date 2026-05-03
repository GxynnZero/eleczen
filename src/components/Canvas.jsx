// =============================================================
// Canvas.jsx — Pure renderer + event router
//
// Rules enforced here:
//   ✔  Reads only from `ctx` (CanvasContext)
//   ✔  Delegates ALL mutations through ctx.actions
//   ✔  Zero direct manager imports
//   ✔  Zero raw business logic
// =============================================================

import { For, Show, createSignal, useContext } from 'solid-js';
import { CanvasCtx } from '~/utils/canvas/canvasCtx.jsx';

// ─── Sub-component: per-component symbol SVG ────────────────
function PartBody(props) {
  const active = () => props.component.state?.active;
  const type   = props.component.type;

  if (type === 'battery') return (
    <g class="symbol">
      <line x1="-56" y1="0" x2="-18" y2="0" />
      <line x1="18"  y1="0" x2="56"  y2="0" />
      <line x1="-18" y1="-26" x2="-18" y2="26" />
      <line x1="6"   y1="-16" x2="6"   y2="16" />
      <text x="-21" y="-34" class="symbol-text">+</text>
      <text x="3"   y="-34" class="symbol-text">-</text>
    </g>
  );

  if (type === 'led') return (
    <g class={`symbol ${active() ? 'symbol-hot' : ''}`}>
      <line    x1="-54" y1="0"   x2="-22" y2="0"  />
      <line    x1="24"  y1="0"   x2="54"  y2="0"  />
      <polygon points="-22,-24 -22,24 20,0"        />
      <line    x1="24"  y1="-24" x2="24" y2="24"  />
      <line    x1="8"   y1="-30" x2="25" y2="-47" />
      <line    x1="24"  y1="-30" x2="41" y2="-47" />
    </g>
  );

  if (type === 'capacitor') return (
    <g class="symbol">
      <line x1="-54" y1="0"   x2="-15" y2="0"   />
      <line x1="15"  y1="0"   x2="54"  y2="0"   />
      <line x1="-15" y1="-27" x2="-15" y2="27"  />
      <line x1="15"  y1="-27" x2="15"  y2="27"  />
    </g>
  );

  if (type === 'switch') return (
    <g class="symbol">
      <line   x1="-54" y1="0"  x2="-18" y2="0"   />
      <line   x1="18"  y1="0"  x2="54"  y2="0"   />
      <line   x1="-18" y1="0"  x2="18"  y2="-22" />
      <circle cx="-18" cy="0"  r="4"              />
      <circle cx="18"  cy="0"  r="4"              />
    </g>
  );

  // ── New symbols ──────────────────────────────────────────────
  if (type === 'inductor') return (
    <g class="symbol">
      <line x1="-60" y1="0" x2="-36" y2="0" />
      <path d="M-36,0 Q-30,-18 -24,0 Q-18,-18 -12,0 Q-6,-18 0,0 Q6,-18 12,0 Q18,-18 24,0 Q30,-18 36,0" fill="none" />
      <line x1="36"  y1="0" x2="60"  y2="0" />
    </g>
  );

  if (type === 'diode') return (
    <g class="symbol">
      <line    x1="-54" y1="0" x2="-20" y2="0" />
      <line    x1="20"  y1="0" x2="54"  y2="0" />
      <polygon points="-20,-20 -20,20 20,0"     />
      <line    x1="20" y1="-20" x2="20" y2="20" />
    </g>
  );

  if (type === 'zener') return (
    <g class="symbol">
      <line    x1="-54" y1="0" x2="-20" y2="0" />
      <line    x1="20"  y1="0" x2="54"  y2="0" />
      <polygon points="-20,-20 -20,20 20,0"     />
      {/* Zener bend on cathode */}
      <line x1="20" y1="-20" x2="20" y2="20" />
      <line x1="20" y1="-20" x2="28" y2="-28" />
      <line x1="20" y1="20"  x2="12" y2="28"  />
    </g>
  );

  if (type === 'npn') return (
    <g class="symbol">
      {/* Base line */}
      <line x1="-54" y1="0" x2="-14" y2="0" />
      {/* Body vertical */}
      <line x1="-14" y1="-30" x2="-14" y2="30" />
      {/* Collector */}
      <line x1="-14" y1="-18" x2="0" y2="-44" />
      {/* Emitter with arrow */}
      <line x1="-14" y1="18"  x2="0" y2="44"  />
      <polygon points="0,44 -10,30 0,36" fill="currentColor" />
      {/* Collector/emitter leads */}
      <line x1="0" y1="-44" x2="0" y2="-54" />
      <line x1="0" y1="44"  x2="0" y2="54"  />
    </g>
  );

  if (type === 'pnp') return (
    <g class="symbol">
      <line x1="-54" y1="0" x2="-14" y2="0" />
      <line x1="-14" y1="-30" x2="-14" y2="30" />
      <line x1="-14" y1="-18" x2="0" y2="-44" />
      <line x1="-14" y1="18"  x2="0" y2="44"  />
      {/* Arrow points inward for PNP */}
      <polygon points="-14,18 -4,28 -14,30" fill="currentColor" />
      <line x1="0" y1="-44" x2="0" y2="-54" />
      <line x1="0" y1="44"  x2="0" y2="54"  />
    </g>
  );

  if (type === 'mosfet_n') return (
    <g class="symbol">
      {/* Gate */}
      <line x1="-54" y1="0" x2="-18" y2="0" />
      <line x1="-18" y1="-28" x2="-18" y2="28" />
      {/* Body */}
      <line x1="-10" y1="-28" x2="-10" y2="28" />
      {/* D/S */}
      <line x1="-10" y1="-18" x2="0" y2="-18" />
      <line x1="-10" y1="18"  x2="0" y2="18"  />
      <line x1="0"   y1="-18" x2="0" y2="-54" />
      <line x1="0"   y1="18"  x2="0" y2="54"  />
      {/* Arrow */}
      <polygon points="-10,0 0,-8 0,8" fill="currentColor" />
    </g>
  );

  if (type === 'voltmeter') return (
    <g class="symbol">
      <line   x1="-48" y1="0" x2="-22" y2="0" />
      <line   x1="22"  y1="0" x2="48"  y2="0" />
      <circle cx="0" cy="0" r="22" fill="none" />
      <text x="0" y="6" text-anchor="middle" class="symbol-text" style="font-size:14px">V</text>
    </g>
  );

  if (type === 'ground') return (
    <g class="symbol">
      <line x1="0" y1="-36" x2="0"   y2="0"  />
      <line x1="-22" y1="0" x2="22"  y2="0"  />
      <line x1="-14" y1="8" x2="14"  y2="8"  />
      <line x1="-6"  y1="16" x2="6"  y2="16" />
    </g>
  );

  // default: resistor
  return (
    <g class="symbol">
      <line     x1="-60" y1="0" x2="-38" y2="0" />
      <polyline points="-38,0 -28,-16 -12,16 4,-16 20,16 36,0" />
      <line     x1="36"  y1="0" x2="60" y2="0"  />
    </g>
  );
}

// ─── Main Canvas component ────────────────────────────────────
export default function Canvas() {
  // All data & actions come from context — Canvas owns NOTHING.
  const ctx = useContext(CanvasCtx);

  // Local UI-only ephemeral state (no business meaning)
  let svgEl;
  const [drag,             setDrag]             = createSignal(null);
  const [pan,              setPan]              = createSignal(null);
  const [wireDraft,        setWireDraft]        = createSignal(null);
  const [probeDraft,       setProbeDraft]       = createSignal(null);
  const [hoveredComponent, setHoveredComponent] = createSignal(null);
  let suppressClick = false;

  const { helpers, actions, wire: wireBuilder, PARTS } = ctx;
  const { geometry, terminals, selection, simulation, viewport: vp, formatValue } = helpers;

  // ─── Pointer helpers ──────────────────────────────────────
  const screenPt = (e) => geometry.screenPointFromEvent(e, svgEl);
  const worldPt  = (e) => geometry.pointFromEvent(e, svgEl);

  // ─── Pan ─────────────────────────────────────────────────
  const startPan = (event) => {
    setPan({ screen: screenPt(event), viewport: helpers.state.viewport() });
  };

  // ─── Component drag ───────────────────────────────────────
  const startDrag = (event, component) => {
    if (event.button !== 0) return;
    event.stopPropagation();

    const tool = helpers.state.settings().tool;

    if (tool === 'delete') { actions.deleteItem('component', component.id); return; }

    if (tool === 'probe') {
      actions.toggleProbeVariable(`i(${simulation.getDeviceName(component)})`);
      return;
    }

    if (tool === 'wire') return;

    svgEl.setPointerCapture?.(event.pointerId);
    actions.selectComponent(component.id);
    actions.remember();
    const pt = worldPt(event);
    setDrag({ type: 'component', id: component.id, dx: pt.x - component.x, dy: pt.y - component.y });
  };

  // ─── Anchor drag ─────────────────────────────────────────
  const startAnchorDrag = (event, wireId, anchorIndex, anchorPoint) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    svgEl.setPointerCapture?.(event.pointerId);
    actions.selectWire(wireId);
    const pt = worldPt(event);
    setDrag({ type: 'anchor', wireId, anchorIndex, dx: pt.x - anchorPoint.x, dy: pt.y - anchorPoint.y });
  };

  // ─── Pointer move ─────────────────────────────────────────
  const dragMove = (event) => {
    const currentPan = pan();
    if (currentPan) {
      const screen = screenPt(event);
      actions.panViewport(
        screen.x - currentPan.screen.x + currentPan.viewport.x - helpers.state.viewport().x,
        screen.y - currentPan.screen.y + currentPan.viewport.y - helpers.state.viewport().y,
      );
      return;
    }

    const draft = wireDraft();
    if (draft) {
      const raw   = worldPt(event);
      const point = geometry.snap(raw.x, raw.y);
      const dist  = Math.hypot(point.x - draft.start.x, point.y - draft.start.y);
      setWireDraft({ ...draft, point, active: draft.active || dist > 6 });
      return;
    }

    const pDraft = probeDraft();
    if (pDraft) {
      const raw   = worldPt(event);
      const point = geometry.snap(raw.x, raw.y);
      const dist  = Math.hypot(point.x - pDraft.start.x, point.y - pDraft.start.y);
      setProbeDraft({ ...pDraft, point, active: pDraft.active || dist > 6 });
      return;
    }

    const item = drag();
    if (!item) return;

    const raw   = worldPt(event);
    const point = geometry.snap(raw.x, raw.y);
    const VBOX  = helpers.VIEWBOX;

    if (item.type === 'component') {
      actions.moveComponent(
        item.id,
        geometry.clamp(point.x - item.dx, 70, VBOX.width  - 70),
        geometry.clamp(point.y - item.dy, 60, VBOX.height - 60),
      );
    } else if (item.type === 'anchor') {
      actions.updateAnchor(item.wireId, item.anchorIndex, point.x - item.dx, point.y - item.dy);
    }
  };

  // ─── Start wire / probe draft ─────────────────────────────
  const startWire = (event, component, port) => {
    const tool = helpers.state.settings().tool;
    if (tool === 'delete' || tool === 'wire-edit') return;
    event.stopPropagation();

    const point = terminals.terminalPoint({ componentId: component.id, portId: port.id });

    if (tool === 'probe') {
      setProbeDraft({ from: { componentId: component.id, portId: port.id }, start: point, point, active: false });
    } else {
      setWireDraft({ from: { componentId: component.id, portId: port.id }, start: point, point, anchors: [], active: false });
    }
  };

  // ─── Pointer up / leave ───────────────────────────────────
  const stopPointer = (event) => {
    const draft = wireDraft();
    if (draft?.active) {
      const target = terminals.terminalNear(worldPt(event), draft.from);
      if (target) actions.connectTerminals(draft.from, target, draft.anchors || []);
      suppressClick = true;
      requestAnimationFrame(() => { suppressClick = false; });
    }

    const pDraft = probeDraft();
    if (pDraft) {
      if (pDraft.active) {
        const target = terminals.terminalNear(worldPt(event), pDraft.from);
        if (target) {
          const sim  = simulation.simulation();
          const n1   = sim?.nodeMap?.get(`${pDraft.from.componentId}_${pDraft.from.portId}`);
          const n2   = sim?.nodeMap?.get(`${target.componentId}_${target.portId}`);
          if (n1 && n2) actions.toggleProbeVariable(`v(${n1}, ${n2})`);
        }
      } else {
        const sim = simulation.simulation();
        const n1  = sim?.nodeMap?.get(`${pDraft.from.componentId}_${pDraft.from.portId}`);
        if (n1) actions.toggleProbeVariable(`v(${n1})`);
      }
      suppressClick = true;
      requestAnimationFrame(() => { suppressClick = false; });
    }

    setWireDraft(null);
    setProbeDraft(null);
    setDrag(null);
    setPan(null);
  };

  // ─── Render ───────────────────────────────────────────────
  const VBOX = helpers.VIEWBOX;

  return (
    <div class="canvas-shell">
      <svg
        ref={svgEl}
        viewBox={`0 0 ${VBOX.width} ${VBOX.height}`}
        class={`board ${helpers.state.settings().tool === 'probe' ? 'probe-cursor' : ''}`}

        onWheel={(event) => {
          event.preventDefault();
          const factor = event.deltaY > 0 ? 0.9 : 1.1;
          vp.zoomAt(svgEl, event, factor);
        }}

        onContextMenu={(event) => {
          event.preventDefault();
          const draft = wireDraft();
          if (draft?.active) {
            const raw = worldPt(event);
            const pt  = geometry.snap(raw.x, raw.y);
            setWireDraft({ ...draft, anchors: [...(draft.anchors || []), pt] });
          }
        }}

        onPointerMove={dragMove}
        onPointerUp={stopPointer}
        onPointerLeave={stopPointer}

        onPointerDown={(event) => {
          if (event.button !== 0) return;
          actions.clearSelection();
          const tool = helpers.state.settings().tool;
          if (tool === 'select' || tool === 'pan') {
            startPan(event);
          }
        }}
      >
        {/* ── Defs ── */}
        <defs>
          <pattern id="grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" stroke="rgba(148,163,184,0.15)" stroke-width="1" fill="none" />
          </pattern>
          <pattern id="grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" stroke="rgba(148,163,184,0.35)" stroke-width="1.5" fill="none" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Background ── */}
        <rect width={VBOX.width} height={VBOX.height} class="board-bg" />

        <g transform={`translate(${helpers.state.viewport().x} ${helpers.state.viewport().y}) scale(${helpers.state.viewport().zoom})`}>

          {/* ── Grid ── */}
          {helpers.state.settings().grid && (
            <>
              <rect x={-5000} y={-5000} width={10000} height={10000} fill="url(#grid-minor)" />
              <rect x={-5000} y={-5000} width={10000} height={10000} fill="url(#grid-major)" />
            </>
          )}

          {/* ── Wires ── */}
          <For each={helpers.state.wires()}>
            {(w) => {
              const editing = () => {
                // wireEditTarget lives on wm — access via actions (ctx doesn't expose signal, so we derive)
                return ctx.wm.wireEditTarget()?.wireId === w.id;
              };
              return (
                <g>
                  <path
                    d={wireBuilder.wirePath(w)}
                    class={`wire ${selection.isSelected('wire', w.id) ? 'selected' : ''} ${editing() ? 'editing' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      const tool = helpers.state.settings().tool;

                      if (tool === 'delete') { actions.deleteItem('wire', w.id); return; }

                      if (tool === 'probe') {
                        const sim = simulation.simulation();
                        const n1  = sim?.nodeMap?.get(`${w.from.componentId}_${w.from.portId}`);
                        if (n1) actions.toggleProbeVariable(`v(${n1})`);
                        return;
                      }

                      if (tool === 'wire-edit') {
                        actions.selectWire(w.id);
                        const clickPt  = worldPt(event);
                        const fromPt   = terminals.terminalPoint(w.from);
                        const toPt     = terminals.terminalPoint(w.to);
                        const endpoint =
                          Math.hypot(clickPt.x - fromPt.x, clickPt.y - fromPt.y) <=
                          Math.hypot(clickPt.x - toPt.x,   clickPt.y - toPt.y)
                            ? 'from' : 'to';
                        actions.beginWireEdit(w.id, endpoint);
                        return;
                      }

                      actions.selectWire(w.id);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const clickPt = worldPt(event);
                      actions.updateAnchor(w.id, (w.anchors || []).length, clickPt.x, clickPt.y);
                    }}
                  />

                  {/* Anchor handles */}
                  {selection.isSelected('wire', w.id) &&
                    (w.anchors || []).map((anchor, i) => (
                      <circle
                        cx={anchor.x}
                        cy={anchor.y}
                        r="6"
                        class="wire-anchor"
                        onPointerDown={(e) => startAnchorDrag(e, w.id, i, anchor)}
                      />
                    ))}
                </g>
              );
            }}
          </For>

          {/* Draft wire */}
          {wireDraft()?.active && (
            <path d={wireBuilder.draftPath(wireDraft())} class="wire draft" />
          )}

          {/* Probe draft */}
          <Show when={probeDraft()}>
            {(draft) => (
              <line
                x1={draft().start.x} y1={draft().start.y}
                x2={draft().point.x} y2={draft().point.y}
                class="probe-line"
              />
            )}
          </Show>

          {/* ── Components ── */}
          <For each={helpers.state.components()}>
            {(component) => {
              const spec = PARTS[component.type];
              return (
                <g
                  class={`part ${selection.isSelected('component', component.id) ? 'selected' : ''} ${component.state?.active ? 'active' : ''}`}
                  transform={`translate(${component.x} ${component.y}) rotate(${component.rotation || 0}) scale(${component.mirror ? -1 : 1}, 1)`}
                  onPointerDown={(e) => startDrag(e, component)}
                  onPointerEnter={() => setHoveredComponent(component.id)}
                  onPointerLeave={() => setHoveredComponent(null)}
                >
                  <rect x="-78" y="-50" width="156" height="100" rx="8" class="hitbox" />

                  <PartBody component={component} />

                  {helpers.state.settings().showLabels && (
                    <text
                      x="0" y="45"
                      class="part-label"
                      transform={component.mirror ? 'scale(-1, 1)' : ''}
                    >
                      {spec?.label}
                    </text>
                  )}

                  {/* Probe tooltip */}
                  <Show when={helpers.state.settings().tool === 'probe' && hoveredComponent() === component.id}>
                    <text
                      x="0" y="-45"
                      class="probe-tooltip"
                      transform={component.mirror ? 'scale(-1, 1)' : ''}
                    >
                      {formatValue(simulation.getSimValue(`i(${simulation.getDeviceName(component)})`), 'A')}
                    </text>
                  </Show>

                  {/* Ports */}
                  <For each={spec?.ports}>
                    {(port) => (
                      <g
                        class={`port ${selection.isPending(component.id, port.id) ? 'pending' : ''}`}
                        transform={`translate(${port.x} ${port.y})`}
                        onPointerDown={(e) => startWire(e, component, port)}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (suppressClick) return;

                          const tool = helpers.state.settings().tool;

                          if (tool === 'select') {
                            if (actions.tryStartWireEditFromTerminal(component.id, port.id)) return;
                          }

                          if (tool === 'delete') return;

                          if (tool === 'wire-edit' && ctx.wm.wireEditTarget()) {
                            actions.finishWireEdit(component.id, port.id);
                            return;
                          }

                          actions.connectPort(component.id, port.id);
                        }}
                      >
                        <circle r="8" />
                        {helpers.state.settings().showLabels && <text y="-13">{port.label}</text>}
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
