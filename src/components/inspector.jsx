import { createMemo, Show } from "solid-js";
import { partValue, selectedComponent, selectedWire, setComponentValue, settings, simulation } from "../store/state";
import { CircleOff } from "lucide-solid";

const Inspector = () => {
    const component = createMemo(() => selectedComponent());
    const wire = createMemo(() => selectedWire());

    const format = (value, unit = '') =>
        Number.isFinite(value) ? `${value.toFixed(2)} ${unit}` : '-';

    const formatCurrent = (amps) =>
        amps ? `${(amps * 1000).toFixed(1)} mA` : '0 mA';

    function Metric(props) {
        return (
            <div class="metric">
                <span>{props.label}</span>
                <strong>{props.value}</strong>
            </div>
        );
    }

    return (
        <section class="panel inspector h-full overflow-auto">
            <div class="panel-title">Inspector</div>

            <Show when={component()}>
                <Metric
                    label="Current"
                    value={formatCurrent(component()?.state?.current)}
                />

                <Metric
                    label="Voltage"
                    value={format(component()?.state?.voltage, 'V')}
                />

                <label class="field editable">
                    <span>Value</span>
                    <input
                        type="number"
                        value={partValue(component())}
                        onChange={(e) =>
                            setComponentValue(component().id, e.currentTarget.value)
                        }
                    />
                </label>
                <label class="field editable">
                    <span>Netlist</span>
                    <textarea class="disabled" value={""} onChange={simulation.netlist}></textarea>
                </label>
            </Show>

            <Show when={wire()}>
                <div class="field">
                    <span>Wire</span>
                    <strong>{wire()?.id}</strong>
                </div>
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