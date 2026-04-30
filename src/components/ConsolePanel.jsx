import { createMemo, createSignal, createEffect, For, Show, onCleanup, onMount } from 'solid-js';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

import {
    analysisMode,
    setAnalysisMode,
    probeVariables,
    toggleProbeVariable,
    runSimulation,
    stopSimulation,
    simulation,
    simulationRunning,
    logs,
} from '../store/state.js';

/* ---------------- helpers ---------------- */

function buildPlotData(raw, selected) {
    if (!raw?.data || !selected.length) return null;

    const length = raw.numPoints || raw.data?.[0]?.values?.length || 0;
    if (!length) return null;

    const x = Array.from({ length }, (_, i) => i + 1);
    const rows = [x];

    for (const key of selected) {
        const found = raw.data.find((item) => item.name === key);

        rows.push(
            found?.values?.map((v) => {
                const num = Number(v);
                return Number.isFinite(num) ? num : 0;
            }) || Array(length).fill(0),
        );
    }

    return rows;
}

const BLUE = ['#00b7ff', '#3b82f6', '#60a5fa', '#38bdf8', '#2563eb'];

function chartOptions(width, selected) {
    return {
        width,
        height: 320,

        title: 'Signal Waveforms',

        cursor: {
            drag: { x: true, y: false },
            focus: { prox: 30 },
        },

        legend: {
            show: true,
        },

        scales: {
            x: { time: false },
            y: { auto: true },
        },

        axes: [
            {
                stroke: '#3b82f6',
                grid: { stroke: '#0f172a' },
                ticks: { stroke: '#1e40af' },
                values: (_, vals) => vals.map((v) => `${v}`),
            },
            {
                stroke: '#3b82f6',
                grid: { stroke: '#0f172a' },
                ticks: { stroke: '#1e40af' },
            },
        ],

        series: [
            {},
            ...selected.map((name, i) => ({
                label: name,
                stroke: BLUE[i % BLUE.length],
                width: 2,
                points: { show: false },
            })),
        ],

        hooks: {
            init: [
                (u) => {
                    u.root.style.background = '#000000';
                    u.root.style.borderRadius = '18px';
                    u.root.style.padding = '8px';
                    u.root.style.boxShadow =
                        '0 0 0 1px rgba(59,130,246,.15), 0 0 40px rgba(37,99,235,.15)';
                },
            ],
        },
    };
}

function StatCard(props) {
    return (
        <div class="rounded-3xl border border-blue-500/20 bg-black p-4 shadow-[0_0_20px_rgba(59,130,246,.08)]">
            <div class="text-xs uppercase tracking-[0.25em] text-blue-400/70">{props.label}</div>
            <div class="mt-2 text-lg font-semibold text-white">{props.value}</div>
        </div>
    );
}

function ModeButton(props) {
    const active = () => analysisMode() === props.value;

    return (
        <button
            onClick={() => setAnalysisMode(props.value)}
            class={`rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-300 ${active()
                ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,.45)]'
                : 'bg-black text-blue-200 border border-blue-500/20 hover:bg-blue-950/40'
                }`}
        >
            {props.children}
        </button>
    );
}

/* ---------------- component ---------------- */

function ConsolePanel() {
    let chartRef;
    let resizeHandler;

    const [chart, setChart] = createSignal(null);

    const sim = createMemo(() => simulation());
    const raw = createMemo(() => sim()?.engine?.raw);
    const variables = createMemo(() => raw()?.variableNames || []);

    const selected = createMemo(() => {
        const current = probeVariables();
        return current.length ? current : variables().slice(0, 3);
    });

    const chartData = createMemo(() => buildPlotData(raw(), selected()));

    const destroyChart = () => {
        const current = chart();

        if (current) {
            current.destroy();
            setChart(null);
        }

        if (resizeHandler) {
            window.removeEventListener('resize', resizeHandler);
            resizeHandler = null;
        }

        if (chartRef) chartRef.innerHTML = '';
    };

    const createPlot = () => {
        const data = chartData();

        if (!chartRef || !data) return;

        destroyChart();

        const plot = new uPlot(
            chartOptions(chartRef.clientWidth || 600, selected()),
            data,
            chartRef,
        );

        setChart(plot);

        resizeHandler = () => {
            plot.setSize({
                width: chartRef.clientWidth || 600,
                height: 320,
            });
        };

        window.addEventListener('resize', resizeHandler);
    };

    onMount(() => {
        createPlot();
    });

    onCleanup(() => {
        destroyChart();
    });

    createEffect(() => {
        const data = chartData();
        const keys = selected().join('|');

        if (!data || !keys) {
            destroyChart();
            return;
        }

        queueMicrotask(() => createPlot());
    });

    return (
        <section class="h-full rounded-[32px] border border-blue-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-6 shadow-[0_0_80px_rgba(37,99,235,.18)] overflow-auto">
            {/* HEADER */}
            <div class="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-white">Simulation Console</h2>
                    <p class="mt-1 text-sm text-blue-200/70">
                        Black + Blue live waveform monitor.
                    </p>
                </div>

                <div class="flex flex-wrap gap-2">
                    <ModeButton value="dc">DC</ModeButton>
                    <ModeButton value="ac">AC</ModeButton>
                    <ModeButton value="transient">Transient</ModeButton>

                    <button
                        onClick={runSimulation}
                        disabled={simulationRunning()}
                        class={`rounded-2xl px-5 py-2 text-sm font-semibold text-white transition hover:scale-105 ${simulationRunning() ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-400'}`}
                    >
                        Run Simulation
                    </button>
                    <button
                        onClick={stopSimulation}
                        disabled={!simulationRunning()}
                        class={`rounded-2xl px-5 py-2 text-sm font-semibold transition ${simulationRunning() ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-slate-800 text-slate-300 cursor-not-allowed'}`}
                    >
                        Stop
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div class="mb-6 grid gap-4 md:grid-cols-3">
                <StatCard label="Status" value={sim()?.engine?.status || 'idle'} />
                <StatCard label="Mode" value={analysisMode()} />
                <StatCard label="Message" value={sim()?.message || 'Ready'} />
            </div>

            {/* MAIN */}
            <div class="grid gap-6 xl:grid-cols-[320px_1fr_320px]">
                {/* LEFT */}
                <div class="rounded-3xl border border-blue-500/20 bg-black p-5">
                    <div class="mb-4 text-sm font-semibold text-white">Probe Variables</div>

                    <Show
                        when={variables().length}
                        fallback={<p class="text-sm text-blue-200/60">Run simulation first.</p>}
                    >
                        <div class="max-h-[520px] space-y-2 overflow-auto pr-1">
                            <For each={variables()}>
                                {(name) => (
                                    <label class="flex cursor-pointer items-center gap-3 rounded-2xl border border-blue-500/10 bg-blue-950/10 px-3 py-2 text-sm text-blue-100 transition hover:border-blue-400/40">
                                        <input
                                            type="checkbox"
                                            checked={probeVariables().includes(name)}
                                            onChange={() => toggleProbeVariable(name)}
                                            class="accent-blue-500"
                                        />
                                        <span class="truncate">{name}</span>
                                    </label>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>

                {/* CENTER */}
                <div class="rounded-3xl border border-blue-500/20 bg-black p-5">
                    <div class="mb-4 flex items-center justify-between">
                        <div class="text-sm font-semibold text-white">Waveform Chart</div>
                        <div class="text-xs text-blue-300/70">
                            {selected().length} channels selected
                        </div>
                    </div>

                    <Show
                        when={chartData()}
                        fallback={
                            <div class="flex h-[320px] items-center justify-center text-sm text-blue-200/60">
                                Select probes to render chart.
                            </div>
                        }
                    >
                        <div ref={chartRef} class="h-[320px] w-full overflow-hidden rounded-2xl" />
                    </Show>
                </div>

                {/* RIGHT */}
                <div class="space-y-6">
                    <div class="rounded-3xl border border-blue-500/20 bg-black p-5">
                        <div class="mb-3 text-sm font-semibold text-white">Raw Output</div>

                        <pre class="max-h-56 overflow-auto whitespace-pre-wrap text-xs text-blue-100/80">
                            {sim()?.engine?.raw?.header ||
                                String(sim()?.engine?.raw || 'No output')}
                        </pre>
                    </div>

                    <div class="rounded-3xl border border-blue-500/20 bg-black p-5">
                        <div class="mb-3 text-sm font-semibold text-white">Recent Logs</div>

                        <div class="space-y-2">
                            <For each={logs()}>
                                {(entry) => (
                                    <div class="rounded-2xl border-l-4 border-blue-500 bg-blue-950/10 px-3 py-2 text-sm">
                                        <div class="font-semibold capitalize text-white">
                                            {entry.level}
                                        </div>
                                        <div class="text-blue-100/80">{entry.text}</div>
                                    </div>
                                )}
                            </For>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ConsolePanel;