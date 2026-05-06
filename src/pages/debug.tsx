import uPlot, { AlignedData, Options } from "uplot";
import "uplot/dist/uPlot.min.css";
import { onMount, createSignal, onCleanup } from "solid-js";
import { Play, Sparkles, Terminal } from "lucide-solid";
import { runSimulation } from "../lib/simulation/eecircuitEngine";

import { formatSI } from "../adapters/chartAdapter";

const colors = ["#22d3ee", "#f43f5e", "#a855f7", "#eab308", "#10b981"];

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
                tooltip.style.background = "rgba(0, 0, 0, 0.8)";
                tooltip.style.color = "white";
                tooltip.style.padding = "8px 12px";
                tooltip.style.borderRadius = "8px";
                tooltip.style.pointerEvents = "none";
                tooltip.style.zIndex = "100";
                tooltip.style.fontSize = "12px";
                tooltip.style.fontFamily = "monospace";
                tooltip.style.border = "1px solid rgba(255,255,255,0.1)";
                tooltip.style.backdropFilter = "blur(8px)";
                tooltip.style.boxShadow = "0 8px 32px rgba(0,0,0,0.5)";
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
                html += `<div style="font-weight:bold;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:4px">Time: ${formatSI(xVal)}s</div>`;
                
                for (let i = 1; i < u.series.length; i++) {
                    const s = u.series[i];
                    if (s.show) {
                        const yVal = u.data[i][idx];
                        const color = typeof s.stroke === 'function' ? s.stroke(u, i) : s.stroke;
                        html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                            <span style="display:inline-block;width:8px;height:8px;background:${color};border-radius:50%"></span>
                            <span style="color:#a1a1aa">${s.label}:</span> 
                            <span>${yVal != null ? formatSI(yVal) : '--'}V</span>
                        </div>`;
                    }
                }

                tooltip.innerHTML = html;
                tooltip.style.display = "block";
                
                const bBox = u.root.querySelector('.u-over')?.getBoundingClientRect();
                if (bBox) {
                    // Start rendering off-screen for a tick to get true dimensions
                    const tipRect = tooltip.getBoundingClientRect();
                    let tLeft = left + 15;
                    let tTop = top + 15;
                    
                    if (tLeft + tipRect.width > bBox.width) tLeft = left - tipRect.width - 15;
                    if (tTop + tipRect.height > bBox.height) tTop = top - tipRect.height - 15;

                    tooltip.style.left = `${tLeft}px`;
                    tooltip.style.top = `${tTop}px`;
                }
            }
        }
    };
}

export default function Debug() {
    const [netlist, setNetlist] = createSignal(`* Simple RC Circuit
V1 N001 0 5
C1 0 N002 1u
R1 N002 N001 1k
.tran 0.1m 10m uic
.print tran V(N001) V(N002)
.end`);

    const [rawOutput, setRawOutput] = createSignal("Waiting for simulation...");
    const [isSimulating, setIsSimulating] = createSignal(false);
    
    let chartRef: HTMLDivElement | undefined;
    let uPlotInst: uPlot | null = null;

    const renderChart = (headers: string[], data: AlignedData) => {
        if (!chartRef) return;
        if (uPlotInst) {
            uPlotInst.destroy();
            uPlotInst = null;
        }

        const series: uPlot.Series[] = [
            {} // X axis (time)
        ];

        for (let i = 1; i < headers.length; i++) {
            series.push({
                label: headers[i],
                stroke: colors[(i - 1) % colors.length],
                width: 2
            });
        }

        const axes: uPlot.Axis[] = [
            {
                label: headers[0] || "time(s)",
                grid: { show: true, stroke: "rgba(255,255,255,0.1)" },
                stroke: "#a1a1aa",
                values: (u, vals) => vals.map(v => formatSI(v))
            },
            {
                label: "amplitude",
                grid: { show: true, stroke: "rgba(255,255,255,0.1)" },
                stroke: "#a1a1aa",
                values: (u, vals) => vals.map(v => formatSI(v))
            }
        ];

        const opts: Options = {
            width: chartRef.clientWidth,
            height: chartRef.clientHeight,
            title: "Simulation Trace",
            cursor: { show: true },
            legend: { show: false }, // Hide the default uPlot legend since we have a tooltip
            plugins: [tooltipPlugin()],
            axes,
            series
        };

        uPlotInst = new uPlot(opts, data, chartRef);
    };

    onMount(() => {
        // Initial empty chart
        renderChart(["time", "signal"], [[0], [0]]);
        
        // Handle resize
        const observer = new ResizeObserver(() => {
            if (uPlotInst && chartRef) {
                uPlotInst.setSize({
                    width: chartRef.clientWidth,
                    height: chartRef.clientHeight
                });
            }
        });
        if (chartRef) observer.observe(chartRef);
        onCleanup(() => observer.disconnect());
    });

    const handleRunSimulation = async () => {
        if (isSimulating()) return;
        setIsSimulating(true);
        setRawOutput("Running simulation...");
        
        try {
            const result = await runSimulation(netlist());
            setRawOutput(result.rawOutput || "No raw output returned.");
            
            if (result.variableNames && result.variableNames.length > 0) {
                const alignedData = result.variableNames.map((_, i) => result.data[i].values) as any as AlignedData;
                renderChart(result.variableNames, alignedData);
            } else {
                console.warn("No parseable data found in output.");
            }
        } catch (error: any) {
            setRawOutput(`Error: ${error.message || error}`);
            console.error("❌ Simulation Error:", error);
        } finally {
            setIsSimulating(false);
        }
    }

    return (
        <div class="flex flex-col min-h-screen w-screen bg-[#05070b] text-white p-8 font-sans overflow-x-hidden relative">
            {/* Background Glows */}
            <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full"></div>
                <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div class="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-8">
                <div class="flex flex-col items-center">
                    <div class="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.3em] text-cyan-200 backdrop-blur-xl mb-4">
                        <Sparkles size={12} />
                        Internal Debug Tool
                    </div>
                    <h1 class="text-4xl font-black tracking-tight text-center bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                        Engine Debugger
                    </h1>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Editor & Controls */}
                    <div class="flex flex-col gap-6 lg:col-span-1">
                        <div class="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 flex flex-col h-[400px]">
                            <div class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Terminal size={14} />
                                Netlist Editor
                            </div>
                            <textarea
                                class="w-full flex-1 bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-sm text-cyan-50 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
                                value={netlist()}
                                onInput={(e) => setNetlist(e.currentTarget.value)}
                                spellcheck={false}
                            />
                        </div>

                        <button 
                            onClick={handleRunSimulation}
                            disabled={isSimulating()}
                            class="group relative flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl font-bold text-white shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            <Play size={20} fill="currentColor" class={isSimulating() ? "animate-pulse" : ""} />
                            <span>{isSimulating() ? "Simulating..." : "Run Simulation"}</span>
                            <div class="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </div>

                    {/* Right Column: Chart & Raw Output */}
                    <div class="flex flex-col gap-6 lg:col-span-2">
                        <div class="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl overflow-hidden h-[450px] flex flex-col">
                            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_50%)] pointer-events-none"></div>
                            <div ref={chartRef} class="w-full flex-1 rounded-xl overflow-hidden bg-black/20 border border-white/5"></div>
                        </div>

                        <div class="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 h-[250px] flex flex-col">
                            <div class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                Raw Ngspice Output
                            </div>
                            <div class="w-full flex-1 bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-y-auto whitespace-pre-wrap break-words">
                                {rawOutput()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
