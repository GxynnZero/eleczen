import { createMemo, Show } from "solid-js";
import {
  partValue,
  selectedComponent,
  selectedWire,
  setComponentValue,
  settings,
  simulation,
  wireEditTarget,
  updateSelectedPosition,
} from "../utils/simulation";
import { CircleOff } from "lucide-solid";

const Inspector = () => {
  const component = createMemo(() => selectedComponent());
  const wire = createMemo(() => selectedWire());
  const edit = createMemo(() => wireEditTarget());

  const getSimValue = (name) => {
    const data = simulation()?.engine?.raw?.data;
    if (!data) return null;
    const lowerName = name.toLowerCase();
    const series = data.find(s => s.name.toLowerCase() === lowerName);
    if (!series || !series.values?.length) return null;
    const val = Number(series.values.at(-1));
    return Number.isFinite(val) ? val : null;
  };

  const getDeviceName = (comp) => {
    if (!comp) return '';
    const pfx = {
      battery: 'V',
      resistor: 'R',
      led: 'D',
      capacitor: 'C',
      switch: 'R'
    }[comp.type] || 'X';

    let name = `${pfx}_${comp.id.replace(/\W/g, '_')}`;
    if (comp.type === 'switch') name += '_SW';
    return name;
  };

  const simMetrics = createMemo(() => {
    const comp = component();
    if (!comp) return null;

    const iVal = getSimValue(`i(${getDeviceName(comp)})`);

    const nodeMap = simulation()?.nodeMap;
    let vDrop = null;

    if (nodeMap) {
      const n1 =
        nodeMap.get(`${comp.id}_1`) ||
        nodeMap.get(`${comp.id}_+`) ||
        nodeMap.get(`${comp.id}_in`);

      const n2 =
        nodeMap.get(`${comp.id}_2`) ||
        nodeMap.get(`${comp.id}_-`) ||
        nodeMap.get(`${comp.id}_out`) ||
        nodeMap.get(`${comp.id}_gnd`);

      if (n1 && n2) {
        const v1 = getSimValue(`v(${n1})`) || 0;
        const v2 = getSimValue(`v(${n2})`) || 0;
        vDrop = Math.abs(v1 - v2);
      }
    }

    const pwr =
      iVal != null && vDrop != null
        ? Math.abs(iVal * vDrop)
        : null;

    return {
      current: iVal,
      voltage: vDrop,
      power: pwr
    };
  });

  const wireLength = createMemo(() => {
    const w = wire();
    if (!w) return null;

    const pts = [
      ...(w.anchors || [])
    ];

    if (pts.length < 1) return null;

    let len = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      len += Math.hypot(
        pts[i + 1].x - pts[i].x,
        pts[i + 1].y - pts[i].y
      );
    }

    return len;
  });

  const format = (value, unit = '') => {
    if (value == null) return '--';
    const abs = Math.abs(value);

    if (abs >= 1) return value.toFixed(2) + ' ' + unit;
    if (abs >= 1e-3) return (value * 1e3).toFixed(2) + ' m' + unit;
    if (abs >= 1e-6) return (value * 1e6).toFixed(2) + ' μ' + unit;

    return value.toExponential(2) + ' ' + unit;
  };

  const Metric = (props) => (
    <div class="metric">
      <span>{props.label}</span>
      <strong>{props.value}</strong>
    </div>
  );

  return (
    <section class="panel inspector h-full overflow-auto">
      <div class="panel-title">Inspector</div>

      <Show when={component()}>
        <Metric label="ID" value={component().id} />
        <Metric label="Type" value={component().type} />

        <div class="panel-title text-xs text-gray-500 mt-4 border-t border-gray-800 pt-2">Properties</div>
        <label class="field editable mt-2">
          <span>X Coord</span>
          <input
            type="number"
            value={component().x}
            onChange={(e) => updateSelectedPosition({ x: Number(e.currentTarget.value) || 0 })}
          />
        </label>
        <label class="field editable">
          <span>Y Coord</span>
          <input
            type="number"
            value={component().y}
            onChange={(e) => updateSelectedPosition({ y: Number(e.currentTarget.value) || 0 })}
          />
        </label>
        <label class="field editable">
          <span>Rotation</span>
          <input
            type="number"
            step="90"
            value={component().rotation || 0}
            onChange={(e) => updateSelectedPosition({ rotation: Number(e.currentTarget.value) || 0 })}
          />
        </label>
        <label class="field editable mt-2 mb-4">
          <span>Value</span>
          <input
            type="number"
            value={partValue(component())}
            onChange={(e) =>
              setComponentValue(component().id, e.currentTarget.value)
            }
          />
        </label>

        <div class="panel-title text-xs text-gray-500 mt-2 border-t border-gray-800 pt-2">Simulation Metrics</div>
        <Metric
          label="Current"
          value={format(simMetrics()?.current, 'A')}
        />
        <Metric
          label="Voltage Drop"
          value={format(simMetrics()?.voltage, 'V')}
        />
        <Metric
          label="Power"
          value={format(simMetrics()?.power, 'W')}
        />
      </Show>

      <Show when={wire()}>
        <div class="field">
          <span>Wire</span>
          <strong>{wire()?.id}</strong>
        </div>
        <Show when={settings().tool === 'wire-edit'}>
          <div class="field info">
            <span>Wire edit</span>
            <strong>{wireEditTarget()?.endpoint ? `Editing ${wireEditTarget().endpoint}` : 'Tap a wire endpoint'}</strong>
          </div>
        </Show>
      </Show>

      <Show when={!component() && !wire()}>
        <div class="empty-state">
          <CircleOff size={20} />
          <span>No selection</span>
        </div>
      </Show>
    </section>
  );
}

export default Inspector;