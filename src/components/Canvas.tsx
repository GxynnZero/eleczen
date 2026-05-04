// =============================================================
// Canvas.jsx — Pure renderer + event router
//
// Rules enforced here:
//   ✔  Reads only from `ctx` (CanvasContext)
//   ✔  Delegates ALL mutations through ctx.actions
//   ✔  Zero direct manager imports
//   ✔  Zero raw business logic
// =============================================================

import { For, JSX, Show, createSignal, useContext } from "solid-js";
import { CanvasCtx } from "~/utils/canvas/canvasCtx";
import { PartBody } from "./partBody";
import {
  Component,
  DragState,
  ID,
  PanState,
  Point,
  ProbeDraft,
  WireDraft,
} from "~/types";

// ─── Main Canvas component ────────────────────────────────────
export default function Canvas(): JSX.Element {
  // All data & actions come from context — Canvas owns NOTHING.
  const ctx = useContext(CanvasCtx);

  let svgEl!: SVGSVGElement;
  const [drag, setDrag] = createSignal<DragState | null>(null);
  const [pan, setPan] = createSignal<PanState | null>(null);
  const [wireDraft, setWireDraft] = createSignal<WireDraft | null>(null);
  const [probeDraft, setProbeDraft] = createSignal<ProbeDraft | null>(null);
  const [hoveredComponent, setHoveredComponent] = createSignal<string | null>(
    null,
  );
  let suppressClick = false;

  const { helpers, actions, wire, PARTS } = ctx;
  const {
    geometry,
    terminals,
    selection,
    simulation,
    viewport: vp,
    formatValue,
  } = helpers;

  // ─── Pointer helpers ──────────────────────────────────────
  const screenPt = (e: PointerEvent) => geometry.screenPointFromEvent(e, svgEl);
  const worldPt = (e: MouseEvent) => geometry.pointFromEvent(e, svgEl);

  // ─── Pan ─────────────────────────────────────────────────
  const startPan = (event: PointerEvent) => {
    setPan({
      screen: screenPt(event),
      viewport: helpers.state.viewport(),
    });
  };

  // ─── Component drag ───────────────────────────────────────
  const startDrag = (event: PointerEvent, component: Component) => {
    if (event.button !== 0) return;
    event.stopPropagation();

    const tool = helpers.state.settings().tool;

    if (tool === "run") {
      actions.toggleProbeVariable(`i(${simulation.getDeviceName(component)})`);
      return;
    }

    if (tool === "edit") return;

    svgEl.setPointerCapture?.(event.pointerId);
    actions.selectComponent(component.id);
    actions.remember();
    const pt = worldPt(event);
    setDrag({
      type: "component",
      ids: [component.id],
      origin: { x: component.position.x, y: component.position.y },
      offset: {
        x: pt.x - component.position.x,
        y: pt.y - component.position.y,
      },
    });
  };

  // ─── Anchor drag ─────────────────────────────────────────
  const startAnchorDrag = (
    event: PointerEvent,
    wireId: ID,
    anchorIndex: number,
    anchorPoint: Point,
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    svgEl.setPointerCapture?.(event.pointerId);
    actions.selectWire(wireId);
    const pt = worldPt(event);
    setDrag({
      type: "anchor",
      wireId,
      anchorIndex,
      origin: { x: anchorPoint.x, y: anchorPoint.y },
      offset: {
        x: pt.x - anchorPoint.x,
        y: pt.y - anchorPoint.y,
      },
    });
  };

  // ─── Pointer move ─────────────────────────────────────────
  const dragMove = (event: PointerEvent) => {
    const currentPan = pan();
    if (currentPan) {
      const screen = screenPt(event);
      actions.panViewport(
        screen.x -
          currentPan.screen.x +
          currentPan.viewport.position.x -
          helpers.state.viewport().position.x,
        screen.y -
          currentPan.screen.y +
          currentPan.viewport.position.y -
          helpers.state.viewport().position.y,
      );
      return;
    }

    const draft = wireDraft();
    if (draft) {
      const raw = worldPt(event);
      const point = geometry.snap(raw.x, raw.y);
      const dist = Math.hypot(point.x - draft.start.x, point.y - draft.start.y);
      setWireDraft({
        ...draft,
        current: point,
        active: draft.active || dist > 6,
      });
      return;
    }

    const pDraft = probeDraft();
    if (pDraft) {
      const raw = worldPt(event);
      const point = geometry.snap(raw.x, raw.y);
      const dist = Math.hypot(
        point.x - pDraft.start.x,
        point.y - pDraft.start.y,
      );
      setProbeDraft({
        ...pDraft,
        current: point,
        active: pDraft.active || dist > 6,
      });
      return;
    }

    const item = drag();
    if (!item) return;

    const raw = worldPt(event);
    const point = geometry.snap(raw.x, raw.y);
    const VBOX = helpers.VIEWBOX;

    if (item.type === "component") {
      for (const id of item.ids) {
        actions.moveComponent(
          id,
          geometry.clamp(point.x - item.offset.x, 70, VBOX.width - 70),
          geometry.clamp(point.y - item.offset.y, 60, VBOX.height - 60),
        );
      }
    } else if (item.type === "anchor") {
      actions.updateAnchor(
        item.wireId,
        item.anchorIndex,
        point.x - item.offset.x,
        point.y - item.offset.y,
      );
    }
  };

  // ─── Start wire / probe draft ─────────────────────────────
  const startWire = (event, component, port) => {
    const tool = helpers.state.settings().tool;
    if (tool === "delete" || tool === "wire-edit") return;
    event.stopPropagation();

    const point = terminals.terminalPoint({
      componentId: component.id,
      portId: port.id,
    });

    if (tool === "run") {
      setProbeDraft({
        from: { componentId: component.id, portId: port.id },
        start: point,
        current: point,
        active: false,
      });
    } else if (tool === "edit") {
      setWireDraft({
        from: { componentId: component.id, portId: port.id },
        start: point,
        current: point,
        anchors: [],
        active: false,
      });
    }
  };

  // ─── Pointer up / leave ───────────────────────────────────
  const stopPointer = (event) => {
    const draft = wireDraft();
    if (draft?.active) {
      const target = terminals.terminalNear(worldPt(event), draft.from);
      if (target)
        actions.connectTerminals(draft.from, target, draft.anchors || []);
      suppressClick = true;
      requestAnimationFrame(() => {
        suppressClick = false;
      });
    }

    const pDraft = probeDraft();
    if (pDraft) {
      if (pDraft.active) {
        const target = terminals.terminalNear(worldPt(event), pDraft.from);
        if (target) {
          const sim = simulation.simulation();
          const n1 = sim?.nodeMap?.get(
            `${pDraft.from.componentId}_${pDraft.from.portId}`,
          );
          const n2 = sim?.nodeMap?.get(
            `${target.componentId}_${target.portId}`,
          );
          if (n1 && n2) actions.toggleProbeVariable(`v(${n1}, ${n2})`);
        }
      } else {
        const sim = simulation.simulation();
        const n1 = sim?.nodeMap?.get(
          `${pDraft.from.componentId}_${pDraft.from.portId}`,
        );
        if (n1) actions.toggleProbeVariable(`v(${n1})`);
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

  // ─── Render ───────────────────────────────────────────────
  const VBOX = helpers.VIEWBOX;

  return (
    <div class="canvas-shell">
      <svg
        ref={svgEl}
        viewBox={`0 0 ${VBOX.width} ${VBOX.height}`}
        class={`board ${helpers.state.settings().tool === "run" ? "probe-cursor" : ""}`}
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
            const pt = geometry.snap(raw.x, raw.y);
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
          if (tool === "select" || tool === "pan") {
            startPan(event);
          }
        }}
      >
        {/* ── Defs ── */}
        <defs>
          <pattern
            id="grid-minor"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              stroke="rgba(148,163,184,0.15)"
              stroke-width="1"
              fill="none"
            />
          </pattern>
          <pattern
            id="grid-major"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 120 0 L 0 0 0 120"
              stroke="rgba(148,163,184,0.35)"
              stroke-width="1.5"
              fill="none"
            />
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

        <g
          transform={`translate(${helpers.state.viewport().position.x} ${helpers.state.viewport().position.y}) scale(${helpers.state.viewport().zoom})`}
        >
          {/* ── Grid ── */}
          {helpers.state.settings().grid && (
            <>
              <rect
                x={-5000}
                y={-5000}
                width={10000}
                height={10000}
                fill="url(#grid-minor)"
              />
              <rect
                x={-5000}
                y={-5000}
                width={10000}
                height={10000}
                fill="url(#grid-major)"
              />
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
                    d={wire.wirePath(w)}
                    class={`wire ${selection.isSelected("wire", w.id) ? "selected" : ""} ${editing() ? "editing" : ""}`}
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation();
                      const tool = helpers.state.settings().tool;

                      if (tool === "run") {
                        const sim = simulation.simulation();
                        const n1 = sim?.nodeMap?.get(
                          `${w.from.componentId}_${w.from.portId}`,
                        );
                        if (n1) actions.toggleProbeVariable(`v(${n1})`);
                        return;
                      }

                      if (tool === "edit") {
                        actions.selectWire(w.id);
                        const clickPt = worldPt(event);
                        const fromPt = terminals.terminalPoint(w.from);
                        const toPt = terminals.terminalPoint(w.to);
                        const endpoint =
                          Math.hypot(
                            clickPt.x - fromPt.x,
                            clickPt.y - fromPt.y,
                          ) <=
                          Math.hypot(clickPt.x - toPt.x, clickPt.y - toPt.y)
                            ? "from"
                            : "to";
                        actions.beginWireEdit(w.id, endpoint);
                        return;
                      }

                      actions.selectWire(w.id);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const clickPt = worldPt(event);
                      actions.updateAnchor(
                        w.id,
                        (w.anchors || []).length,
                        clickPt.x,
                        clickPt.y,
                      );
                    }}
                  />

                  {/* Anchor handles */}
                  {selection.isSelected("wire", w.id) &&
                    (w.anchors || []).map((anchor, i) => (
                      <circle
                        cx={anchor.x}
                        cy={anchor.y}
                        r="6"
                        class="wire-anchor"
                        onPointerDown={(e) =>
                          startAnchorDrag(e, w.id, i, anchor)
                        }
                      />
                    ))}
                </g>
              );
            }}
          </For>

          {/* Draft wire */}
          {wireDraft()?.active && (
            <path d={wire.draftPath(wireDraft())} class="wire draft" />
          )}

          {/* Probe draft */}
          <Show when={probeDraft()}>
            {(draft) => (
              <line
                x1={draft().start.x}
                y1={draft().start.y}
                x2={draft().current.x}
                y2={draft().current.y}
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
                  class={`part ${selection.isSelected("component", component.id) ? "selected" : ""} ${component.state?.isActive ? "active" : ""}`}
                  transform={`translate(${component.position.x} ${component.position.y}) rotate(${component.rotation || 0}) scale(${component.mirror ? -1 : 1}, 1)`}
                >
                  <rect
                    x="-78"
                    y="-50"
                    width="156"
                    height="100"
                    rx="8"
                    class="hitbox"
                    onPointerDown={(e) => startDrag(e, component)}
                    onPointerEnter={() => setHoveredComponent(component.id)}
                    onPointerLeave={() => setHoveredComponent(null)}
                  />

                  <PartBody component={component} />

                  {helpers.state.settings().showLabels && (
                    <text
                      x="0"
                      y="45"
                      class="part-label"
                      transform={component.mirror ? "scale(-1, 1)" : ""}
                    >
                      {spec?.label}
                    </text>
                  )}

                  {/* Probe tooltip */}
                  <Show
                    when={
                      helpers.state.settings().tool === "run" &&
                      hoveredComponent() === component.id
                    }
                  >
                    <text
                      x="0"
                      y="-45"
                      class="probe-tooltip"
                      transform={component.mirror ? "scale(-1, 1)" : ""}
                    >
                      {formatValue(
                        simulation.getSimValue(
                          `i(${simulation.getDeviceName(component)})`,
                        ),
                        "A",
                      )}
                    </text>
                  </Show>

                  {/* Ports */}
                  <For each={spec?.ports}>
                    {(port) => (
                      <g
                        class={`port ${selection.isPending(component.id, port.id) ? "pending" : ""}`}
                        transform={`translate(${port.x} ${port.y})`}
                        onPointerDown={(e) => startWire(e, component, port)}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (suppressClick) return;

                          const tool = helpers.state.settings().tool;

                          if (tool === "select") {
                            if (
                              actions.tryStartWireEditFromTerminal(
                                component.id,
                                port.id,
                              )
                            )
                              return;
                          }

                          if (tool === "edit") {
                            if (ctx.wm.wireEditTarget()) {
                              actions.finishWireEdit(component.id, port.id);
                              return;
                            }
                            actions.connectPort(component.id, port.id);
                          }
                        }}
                      >
                        <circle r="8" />
                        {helpers.state.settings().showLabels && (
                          <text y="-13">{port.label}</text>
                        )}
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
