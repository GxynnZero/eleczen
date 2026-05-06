import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { ChartData, Probe } from "../core/types";

const COLOR_PALETTE = ["#22d3ee", "#f43f5e", "#a855f7", "#eab308", "#10b981", "#00b7ff", "#3b82f6"];

export function formatSI(num: number): string {
  if (num === 0 || !isFinite(num)) return num.toString();
  const absNum = Math.abs(num);
  const prefixes = [
      { val: 1e12, symbol: 'T' },
      { val: 1e9, symbol: 'G' },
      { val: 1e6, symbol: 'M' },
      { val: 1e3, symbol: 'k' },
      { val: 1, symbol: '' },
      { val: 1e-3, symbol: 'm' },
      { val: 1e-6, symbol: 'µ' },
      { val: 1e-9, symbol: 'n' },
      { val: 1e-12, symbol: 'p' },
      { val: 1e-15, symbol: 'f' }
  ];

  for (const prefix of prefixes) {
      if (absNum >= prefix.val * 0.999) {
          const value = num / prefix.val;
          return Number(value.toPrecision(3)) + prefix.symbol;
      }
  }
  return num.toExponential(2);
}

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

export function createChartOptions(width: number, height: number, probes: Probe[]): uPlot.Options {
  return {
    plugins: [tooltipPlugin()],
    width,
    height,
    title: "", // Removed title for cleaner UI
    cursor: { show: true },
    legend: { show: false }, // Use tooltip instead
    scales: {
      x: { time: false },
      y: { auto: true },
    },
    axes: [
      {
        label: "time(s)",
        stroke: "#a1a1aa",
        grid: { show: true, stroke: "rgba(255,255,255,0.1)" },
        values: (_, vals) => vals.map((v) => formatSI(v)),
      },
      {
        label: "amplitude",
        stroke: "#a1a1aa",
        grid: { show: true, stroke: "rgba(255,255,255,0.1)" },
        values: (_, vals) => vals.map((v) => formatSI(v)),
      },
    ],
    series: [
      {}, // x-axis (time)
      ...probes.filter((p) => p.visible).map((probe, i) => ({
        label: probe.id,
        stroke: probe.color && probe.color !== "#3b82f6" ? probe.color : COLOR_PALETTE[i % COLOR_PALETTE.length],
        width: 2,
        points: { show: false }, // Hide points for cleaner curves
      } as any)),
    ]
  };
}

export function buildPlotDataArray(data: ChartData, probes: Probe[]): uPlot.AlignedData {
  if (!data.time.length) return [[]];

  const visibleProbes = probes.filter((p) => p.visible);
  
  let timeData = data.time;
  if (timeData.length === 1) {
    timeData = [0, 1]; // Draw a flat line from x=0 to x=1
  }

  const result: uPlot.AlignedData = [timeData];

  for (const probe of visibleProbes) {
    let signalData = data.signals[probe.id];
    if (!signalData) {
      signalData = new Array(timeData.length).fill(0);
    } else if (signalData.length === 1) {
      signalData = [signalData[0], signalData[0]]; // Duplicate the Y point
    }
    result.push(signalData);
  }

  return result;
}
