import { createMemo, createSignal, createEffect, For, Show, onCleanup, onMount } from 'solid-js';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

import { Maximize2, Minimize2 } from 'lucide-solid';

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
    settings,
    toggleConsoleMaximized,
} from '../store/state.js';

/* ---------------- helpers ---------------- */

function buildPlotData(raw, selected) {
    if (!raw?.data || !selected.length) return null;

    const length = raw.numPoints || raw.data?.[0]?.values?.length || 0;
    if (!length) return null;

    const x = raw.data[0].values || Array.from({ length }, (_, i) => i + 1);
    const rows = [x];

    for (const key of selected) {
        const upperKey = key.toUpperCase();
        if (upperKey.startsWith('V(') && key.includes(',')) {
            const match = key.match(/v\(([^,]+),\s*([^)]+)\)/i);
            if (match) {
                const [, node1, node2] = match;
                const n1 = raw.data.find((item) => item.name.toLowerCase() === `v(${node1.toLowerCase()})`);
                const n2 = raw.data.find((item) => item.name.toLowerCase() === `v(${node2.toLowerCase()})`);
                
                rows.push(x.map((_, i) => {
                    const v1 = n1 ? Number(n1.values[i]) : 0;
                    const v2 = n2 ? Number(n2.values[i]) : 0;
                    return (Number.isFinite(v1) ? v1 : 0) - (Number.isFinite(v2) ? v2 : 0);
                }));
                continue;
            }
        }

        const found = raw.data.find((item) => item.name.toLowerCase() === key.toLowerCase());

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

function tooltipPlugin() {
    let tooltip;

    return {
        hooks: {
            init: (u) => {
                tooltip = document.createElement('div');
                tooltip.className = 'u-tooltip';
                tooltip.style.display = 'none';
                u.root.querySelector('.u-over').appendChild(tooltip);
            },
            setCursor: (u) => {
                const { left, top, idx } = u.cursor;
                if (left < 0 || top < 0 || idx == null) {
                    tooltip.style.display = 'none';
                    return;
                }

                let html = `Point: ${u.data[0][idx]}\n`;
                for (let i = 1; i < u.series.length; i++) {
                    const s = u.series[i];
                    if (s.show) {
                        const val = u.data[i][idx];
                        const valStr = val != null ? Number(val).toExponential(3) : '--';
                        html += `<span style="color: ${s.stroke}">${s.label}:</span> ${valStr}\n`;
                    }
                }

                tooltip.innerHTML = html;
                tooltip.style.display = 'block';
                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
            },
        },
    };
}

function chartOptions(width, height, selected) {
    return {
        plugins: [tooltipPlugin()],
        width,
        height,

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
                    u.root.style.padding = '4px';
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
            chartOptions(chartRef.clientWidth || 600, chartRef.clientHeight || 320, selected()),
            data,
            chartRef,
        );

        setChart(plot);

        resizeHandler = () => {
            if (chartRef) {
                plot.setSize({
                    width: chartRef.clientWidth || 600,
                    height: chartRef.clientHeight || 320,
                });
            }
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

    createEffect(() => {
        const isMax = settings().consoleMaximized;
        setTimeout(() => {
            if (chartRef && chart()) {
                chart().setSize({
                    width: chartRef.clientWidth || 600,
                    height: chartRef.clientHeight || 320,
                });
            }
        }, 50);
    });

    return (
        <section class={`flex flex-col bg-[#05070b] text-white text-xs font-mono border-[#1a1f2e] ${settings().consoleMaximized ? 'fixed inset-0 z-50 !h-full !w-full !max-h-full border-0' : 'h-full w-full border-l'}`}>
            {/* TOOLBAR */}
            <div class="flex items-center justify-between bg-[#0f1422] px-3 py-2 border-b border-[#1a1f2e]">
                <div class="flex items-center gap-4">
                    <span class="font-bold text-[#4ade80] uppercase tracking-wider">Sim Console</span>
                    <div class="flex items-center gap-1 border-l border-[#1a1f2e] pl-4">
                        <ModeButton value="dc">DC</ModeButton>
                        <ModeButton value="ac">AC</ModeButton>
                        <ModeButton value="transient">Tran</ModeButton>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-3 text-[#94a3b8]">
                        <span>Status: <span class="text-white">{sim()?.engine?.status || 'idle'}</span></span>
                        <span>Mode: <span class="text-white">{analysisMode()}</span></span>
                        <span class="truncate max-w-[200px]" title={sim()?.message || 'Ready'}>Msg: <span class="text-white">{sim()?.message || 'Ready'}</span></span>
                    </div>

                    <div class="border-l border-[#1a1f2e] pl-3 flex gap-2">
                        <button
                            onClick={runSimulation}
                            disabled={simulationRunning()}
                            class={`px-3 py-1 rounded border ${simulationRunning() ? 'bg-[#1e293b] border-[#334155] text-[#94a3b8] cursor-not-allowed' : 'bg-[#047857] border-[#065f46] hover:bg-[#059669]'}`}
                        >
                            Run
                        </button>
                        <button
                            onClick={stopSimulation}
                            disabled={!simulationRunning()}
                            class={`px-3 py-1 rounded border ${simulationRunning() ? 'bg-[#be123c] border-[#9f1239] hover:bg-[#e11d48]' : 'bg-[#1e293b] border-[#334155] text-[#94a3b8] cursor-not-allowed'}`}
                        >
                            Stop
                        </button>
                    </div>

                    <div class="border-l border-[#1a1f2e] pl-3 flex gap-2">
                        <button
                            onClick={toggleConsoleMaximized}
                            class="p-1.5 rounded border bg-[#1e293b] border-[#334155] text-[#94a3b8] hover:text-white transition"
                            title={settings().consoleMaximized ? "Restore Console" : "Maximize Console"}
                        >
                            <Show when={settings().consoleMaximized} fallback={<Maximize2 size={16} />}>
                                <Minimize2 size={16} />
                            </Show>
                        </button>
                    </div>
                </div>
            </div>

            {/* WORKSPACE */}
            <div class="flex flex-1 min-h-0 overflow-hidden">
                {/* PROBES (LEFT) */}
                <div class="w-48 flex flex-col border-r border-[#1a1f2e] bg-[#0a0d14]">
                    <div class="bg-[#161b26] px-2 py-1 border-b border-[#1a1f2e] font-semibold text-[#94a3b8]">Probes</div>
                    <Show
                        when={variables().length}
                        fallback={<div class="p-2 text-[#475569]">No data</div>}
                    >
                        <div class="flex-1 overflow-y-auto p-1 space-y-1">
                            <For each={variables()}>
                                {(name) => (
                                    <label class="flex cursor-pointer items-center gap-2 rounded hover:bg-[#1e293b] px-2 py-1">
                                        <input
                                            type="checkbox"
                                            checked={probeVariables().includes(name)}
                                            onChange={() => toggleProbeVariable(name)}
                                            class="accent-blue-500"
                                        />
                                        <span class="truncate" title={name}>{name}</span>
                                    </label>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>

                {/* GRAPH (CENTER) */}
                <div class="flex-1 flex flex-col min-w-0 bg-black">
                    <div class="bg-[#161b26] px-2 py-1 border-b border-[#1a1f2e] font-semibold text-[#94a3b8] flex justify-between">
                        <span>Waveform ({selected().length} channels)</span>
                    </div>
                    <div class="flex-1 relative overflow-hidden flex flex-col">
                        <Show
                            when={chartData()}
                            fallback={
                                <div class="flex-1 flex items-center justify-center text-[#475569]">
                                    Select probes to view waveform
                                </div>
                            }
                        >
                            <div ref={chartRef} class="absolute inset-0" />
                        </Show>
                    </div>
                </div>

                {/* RIGHT PANEL (LOGS/RAW) */}
                <div class="w-72 flex flex-col border-l border-[#1a1f2e] bg-[#0a0d14]">
                    {/* NETLIST / RAW */}
                    <div class="flex-1 flex flex-col min-h-0 border-b border-[#1a1f2e]">
                        <div class="bg-[#161b26] px-2 py-1 border-b border-[#1a1f2e] font-semibold text-[#94a3b8]">Raw Output</div>
                        <pre class="flex-1 p-2 overflow-auto whitespace-pre-wrap text-[#cbd5e1]">
                            {sim()?.engine?.raw?.header || String(sim()?.engine?.raw || 'No output')}
                        </pre>
                    </div>

                    {/* LOGS */}
                    <div class="h-1/3 flex flex-col min-h-0">
                        <div class="bg-[#161b26] px-2 py-1 border-b border-[#1a1f2e] font-semibold text-[#94a3b8]">Event Log</div>
                        <div class="flex-1 p-1 overflow-y-auto space-y-1">
                            <For each={logs()}>
                                {(entry) => (
                                    <div class={`px-2 py-1 rounded ${entry.level === 'error' ? 'bg-red-900/30 text-red-200' : entry.level === 'warn' ? 'bg-yellow-900/30 text-yellow-200' : 'text-[#94a3b8]'}`}>
                                        <span class="opacity-50 mr-2">[{entry.level}]</span>
                                        {entry.text}
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