import {
  createMemo,
  createSignal,
  createEffect,
  For,
  Show,
  onCleanup,
  onMount,
} from "solid-js";
import uPlot, { AlignedData, Options } from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  Maximize2,
  Minimize2,
  Terminal,
  Sparkles,
  Activity,
  Cpu,
  Bell,
} from "lucide-solid";

// Import from the new architecture
import { useSimulationStore } from "../stores/simulationStore";
import { extractChartData } from "../core/probe";
import {
  formatSI,
} from "../adapters/chartAdapter";

// Import legacy items for compatibility (canvas state, logs)
import {
  logs,
  settings,
  toggleConsoleMaximized,
} from "../utils/simulation/index";

const colors = ["#22d3ee", "#f43f5e", "#a855f7", "#eab308", "#10b981", "#6366f1", "#f97316"];

function tooltipPlugin(): uPlot.Plugin {
    let tooltip: HTMLDivElement | null = null;

    return {
        hooks: {
            init: (u: uPlot) => {
                const over = u.root.querySelector('.u-over');
                if (!over) return;
                
                tooltip = document.createElement("div");
                tooltip.style.display = "none";
                tooltip.style.position = "absolute";
                tooltip.style.background = "rgba(0, 0, 0, 0.9)";
                tooltip.style.color = "white";
                tooltip.style.padding = "12px 16px";
                tooltip.style.borderRadius = "16px";
                tooltip.style.pointerEvents = "none";
                tooltip.style.zIndex = "100";
                tooltip.style.fontSize = "11px";
                tooltip.style.fontFamily = "'JetBrains Mono', monospace";
                tooltip.style.border = "1px solid rgba(255,255,255,0.15)";
                tooltip.style.backdropFilter = "blur(16px)";
                tooltip.style.boxShadow = "0 12px 64px rgba(0,0,0,0.8)";
                over.appendChild(tooltip);
            },
            setCursor: (u: uPlot) => {
                if (!tooltip) return;
                const { left, top, idx } = u.cursor;
                if (left === undefined || left < 0 || idx === undefined || idx === null) {
                    tooltip.style.display = "none";
                    return;
                }

                let html = "";
                const xVal = u.data[0][idx];
                html += `<div style="font-weight:900;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:8px;color:#22d3ee;letter-spacing:0.1em;text-transform:uppercase">TIME: ${formatSI(xVal)}s</div>`;
                
                for (let i = 1; i < u.series.length; i++) {
                    const s = u.series[i];
                    if (s.show) {
                        const yVal = u.data[i][idx];
                        const color = typeof s.stroke === 'function' ? s.stroke(u, i) : s.stroke;
                        html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:6px">
                            <div style="display:flex;align-items:center;gap:10px">
                                <span style="display:inline-block;width:8px;height:8px;background:${color};border-radius:50%;box-shadow:0 0 10px ${color}"></span>
                                <span style="color:#a1a1aa;font-weight:600;font-size:10px">${s.label}:</span> 
                            </div>
                            <span style="font-weight:bold;color:white;font-size:12px">${yVal != null ? formatSI(yVal) : '--'}V</span>
                        </div>`;
                    }
                }

                tooltip.innerHTML = html;
                tooltip.style.display = "block";
                
                const bBox = u.root.querySelector('.u-over')?.getBoundingClientRect();
                if (bBox) {
                    const tipRect = tooltip.getBoundingClientRect();
                    let tLeft = left + 20;
                    let tTop = top + 20;
                    
                    if (tLeft + tipRect.width > bBox.width) tLeft = left - tipRect.width - 20;
                    if (tTop + tipRect.height > bBox.height) tTop = top - tipRect.height - 20;

                    tooltip.style.left = `${tLeft}px`;
                    tooltip.style.top = `${tTop}px`;
                }
            }
        }
    };
}

export default function ConsolePanel() {
  let chartRef: HTMLDivElement | undefined;
  let uPlotInst: uPlot | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const [expressionInput, setExpressionInput] = createSignal("");

  const {
    simulationData,
    probes,
    toggleProbe,
  } = useSimulationStore();

  const sim = createMemo(() => simulationData());
  const raw = createMemo(() => sim()?.engine?.raw);
  const variables = createMemo(() => raw()?.variableNames || []);

  const chartData = createMemo(() => extractChartData(raw(), probes()));

  const renderChart = () => {
    const data = chartData();
    const activeProbes = probes().filter(p => p.visible);
    
    if (!chartRef || !data || data.time.length <= 1) return;

    if (uPlotInst) {
        uPlotInst.destroy();
        uPlotInst = null;
    }

    const plotData: AlignedData = [data.time];
    const series: uPlot.Series[] = [{}];

    activeProbes.forEach((probe, i) => {
        const signal = data.signals[probe.id];
        if (signal) {
            plotData.push(signal);
            series.push({
                label: probe.id,
                stroke: probe.color && probe.color !== "#3b82f6" ? probe.color : colors[i % colors.length],
                width: 3,
                points: { show: false }
            });
        }
    });

    const opts: Options = {
        width: chartRef.clientWidth,
        height: chartRef.clientHeight,
        cursor: { show: true },
        legend: { show: false },
        plugins: [tooltipPlugin()],
        axes: [
            {
                label: "TIME (s)",
                grid: { show: true, stroke: "rgba(255,255,255,0.03)" },
                stroke: "#52525b",
                values: (u, vals) => vals.map(v => formatSI(v)),
                font: "10px 'JetBrains Mono', monospace",
                labelFont: "bold 10px 'Inter', sans-serif"
            },
            {
                label: "VOLTAGE (V)",
                grid: { show: true, stroke: "rgba(255,255,255,0.03)" },
                stroke: "#52525b",
                values: (u, vals) => vals.map(v => formatSI(v)),
                font: "10px 'JetBrains Mono', monospace",
                labelFont: "bold 10px 'Inter', sans-serif"
            }
        ],
        series
    };

    uPlotInst = new uPlot(opts, plotData, chartRef);
  };

  onMount(() => {
    // Slight delay to ensure parent dimensions are settled
    setTimeout(renderChart, 50);

    resizeObserver = new ResizeObserver(() => {
        if (uPlotInst && chartRef) {
            uPlotInst.setSize({
                width: chartRef.clientWidth,
                height: chartRef.clientHeight
            });
        }
    });

    if (chartRef) resizeObserver.observe(chartRef);
  });

  onCleanup(() => {
    if (uPlotInst) uPlotInst.destroy();
    if (resizeObserver) resizeObserver.disconnect();
  });

  createEffect(() => {
    // Trigger re-render when data or probes change
    const _ = chartData();
    const __ = probes().map(p => p.visible + p.id).join();
    setTimeout(renderChart, 10);
  });

  const handleAddExpression = (e: Event) => {
    e.preventDefault();
    if (expressionInput().trim()) {
      toggleProbe(expressionInput().trim(), "expression");
      setExpressionInput("");
    }
  };

  const ConsoleContent = () => (
    <section
      class={`flex flex-col bg-[#05070b] text-white font-sans relative overflow-hidden transition-all duration-300 ${
        settings().consoleMaximized
          ? "fixed inset-0 z-[1000] h-screen w-screen"
          : "h-full w-full border-l border-white/5"
      }`}
    >
      {/* Dynamic Background Glows */}
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-0 left-1/3 w-[800px] h-[800px] bg-cyan-500/[0.03] blur-[160px] rounded-full -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-1/3 w-[800px] h-[800px] bg-blue-500/[0.03] blur-[160px] rounded-full translate-y-1/2"></div>
      </div>

      <div class="relative z-10 flex flex-col h-full">
        {/* CONSOLE HEADER */}
          <div class="flex items-center justify-between py-2 px-4 border-b border-white/20">
              <h2 class="text-xl font-black tracking-tight text-white flex items-center">
                Console
              </h2>

            <div class="w-px h-8 bg-white/10 mx-2" />

            <button
              onClick={toggleConsoleMaximized}
              class={`p-1 rounded-lg border transition-all duration-300 ${
                settings().consoleMaximized
                  ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)]"
                  : "bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:bg-white/10"
              }`}
            >
              <Show when={settings().consoleMaximized} fallback={<Maximize2 size={24} />}>
                <Minimize2 size={24} />
              </Show>
            </button>
          </div>

        {/* WORKSPACE GRID */}
        <div class="grid grid-cols-1 lg:grid-cols-5 flex-1 min-h-0">
          
          {/* Signal Sidebar */}
          <div class="lg:col-span-1 flex flex-col gap-8 min-h-0">
             <div class="relative border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-6 flex flex-col flex-1 overflow-hidden shadow-2xl">
                <div class="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 flex items-center justify-between">
                    <span class="flex items-center gap-3"><Activity size={16} class="text-cyan-500" /> Vector Matrix</span>
                    <span class="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-xl text-[10px] border border-cyan-500/20">{variables().length}</span>
                </div>
                
                <div class="flex-1 overflow-y-auto space-y-3 pr-3 no-scrollbar">
                    <Show when={variables().length} fallback={
                        <div class="h-full flex flex-col items-center justify-center opacity-20">
                            <Cpu size={48} class="mb-6" />
                            <span class="text-[11px] font-black uppercase tracking-[0.3em] text-center leading-loose">No Analysis<br/>Vector Streams</span>
                        </div>
                    }>
                        <For each={variables()}>{(name) => (
                            <label class={`flex items-center gap-5 p-4 rounded-2xl transition-all cursor-pointer border ${
                                probes().some(p => p.id === name)
                                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-50 shadow-lg shadow-cyan-950/20"
                                    : "bg-white/[0.02] border-transparent text-zinc-600 hover:bg-white/[0.06] hover:text-zinc-300"
                            }`}>
                                <div class={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                                    probes().some(p => p.id === name) ? "bg-cyan-500 border-cyan-300 rotate-0" : "bg-black/40 border-zinc-800 rotate-45 hover:rotate-0"
                                }`}>
                                    <input type="checkbox" checked={probes().some(p => p.id === name)} onChange={() => toggleProbe(name)} class="hidden" />
                                    <Show when={probes().some(p => p.id === name)}>
                                        <div class="w-2.5 h-2.5 bg-white rounded-sm shadow-sm"></div>
                                    </Show>
                                </div>
                                <span class="text-[12px] font-bold font-mono truncate tracking-tight">{name}</span>
                            </label>
                        )}</For>
                    </Show>
                </div>

                <form onSubmit={handleAddExpression} class="mt-6 pt-6 border-t border-white/10">
                    <div class="relative group">
                        <input 
                            type="text" 
                            placeholder="Add Custom Vector..." 
                            value={expressionInput()}
                            onInput={(e) => setExpressionInput(e.currentTarget.value)}
                            class="w-full bg-black/60 border-2 border-white/5 rounded-2xl px-6 py-4 text-xs text-white placeholder-zinc-700 focus:border-cyan-500/50 focus:outline-none transition-all focus:ring-8 focus:ring-cyan-500/5"
                        />
                        <Sparkles size={16} class="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-cyan-500 transition-colors" />
                    </div>
                </form>
             </div>
          </div>

          {/* Waveform Card */}
          <div class="lg:col-span-3 min-h-0 flex relative border border-white/10 bg-white/[0.04] backdrop-blur-3xl shadow-2xl overflow-hidden group">
                <div ref={chartRef} class="w-full h-[calc(100%-3rem)] rounded-3xl overflow-hidden bg-black/30 border border-white/5 shadow-inner"></div>
            </div>
          {/* Dash Inspector */}
            <div class="lg:grid-cols-1 flex-1 grid min-h-0 border-b border-white/10">
                <div class="relative border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-6 flex flex-col overflow-hidden group">
                    <div class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <Terminal size={16} class="text-emerald-500" /> System Netlist
                    </div>
                    <div class="flex-1 bg-black/50 border-b border-white/5 rounded-2xl p-5 font-mono text-[11px] leading-relaxed text-emerald-100/40 overflow-auto no-scrollbar group-hover:text-emerald-100/70 transition-colors shadow-inner">
                        {sim()?.netlist || "* Engine Syncing..."}
                    </div>
                </div>

                <div class="relative bg-white/[0.04] backdrop-blur-3xl p-6 flex flex-col overflow-hidden group">
                    <div class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <Cpu size={16} class="text-blue-500" /> Engine Stdout
                    </div>
                    <div class="flex-1 bg-black/50 border border-white/5 rounded-2xl p-5 font-mono text-[10px] text-zinc-500 overflow-auto whitespace-pre-wrap break-words leading-relaxed no-scrollbar group-hover:text-zinc-300 transition-colors shadow-inner">
                        {sim()?.engine?.raw?.rawOutput || "> System Handshake Complete."}
                    </div>
                </div>

                <div class="relative border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-6 flex flex-col overflow-hidden group">
                    <div class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <Bell size={16} class="text-amber-500" /> Event Stream
                    </div>
                    <div class="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-2">
                        <For each={logs()}>{(entry: any) => (
                            <div class={`p-4 rounded-2xl border transition-all hover:translate-x-1 ${
                                entry.level === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                                entry.level === 'warn' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                                'bg-white/5 border-white/10 text-zinc-600 hover:text-zinc-300'
                            }`}>
                                <div class="text-[11px] font-bold leading-relaxed">{entry.text}</div>
                            </div>
                        )}</For>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );

  return (
    <Show 
      when={settings().consoleMaximized} 
      fallback={<ConsoleContent />}
    >
        <ConsoleContent />
    </Show>
  );
}
