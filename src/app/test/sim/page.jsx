"use client";

import { useEffect, useState } from "react";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { runSpiceSimulation } from "@/lib/simulation/spice";

export default function Sim() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip();

  useEffect(() => {
    async function runSim() {
      const res = await runSpiceSimulation(`
        V1 N001 0 12
        R1 N001 0 1k
        .tran 1ms 10s
        .end
      `);

      const time = res.data[0].values;
      const voltage = res.data[1].values;

      const mapped = time.map((t, i) => ({
        time: t,
        voltage: voltage[i],
      }));

      setData(mapped);
      setLoading(false);
    }

    runSim();
  }, []);

  if (loading) {
    return <div className="m-32">Running simulation…</div>;
  }

  // ----- chart dimensions -----
  const width = 600;
  const height = 600;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };

  const timeMax = Math.max(...data.map(d => d.time));
  const voltMax = Math.max(...data.map(d => d.voltage)) * 2;

  // ----- scales -----
  const xScale = scaleLinear({
    domain: [0, timeMax],
    range: [margin.left, width - margin.right],
  });

  const yScale = scaleLinear({
    domain: [0, voltMax],
    range: [height - margin.bottom, margin.top],
  });

  return (
    <div className="m-32 relative">
      <svg width={width} height={height}>
        {/* grid */}
        <GridRows
          scale={yScale}
          width={width - margin.left - margin.right}
          left={margin.left}
          stroke="#808080ff"
        />
        <GridColumns
          scale={xScale}
          height={height - margin.top - margin.bottom}
          top={margin.top}
          stroke="#808080ff"
        />

        {/* axes */}
        <AxisBottom
          top={height - margin.bottom}
          scale={xScale}
          label="Time (s)"
          stroke="#ffffffff"
          tickStroke="#ffffffff"
          tickLabelProps={() => ({
            fill: "#ffffffff",
            fontSize: 12,
          })}
        />
        <AxisLeft
          left={margin.left}
          scale={yScale}
          label="Voltage (V)"
          stroke="#ffffffff"
          tickStroke="#ffffffff"
          tickLabelProps={() => ({
            fill: "#ffffffff",
            fontSize: 12,
            dy: 6,
            dx: -16,
          })
        }
        />

        {/* line */}
        <LinePath
          data={data}
          x={d => xScale(d.time)}
          y={d => yScale(d.voltage)}
          stroke="#2563eb"
          strokeWidth={2}
        />

        {/* cursor line */}
        {tooltipData && (
          <line
            x1={tooltipLeft}
            x2={tooltipLeft}
            y1={margin.top}
            y2={height - margin.bottom}
            stroke="#2563eb"
            strokeWidth={1}
            pointerEvents="none"
            strokeDasharray="5,2"
          />
        )}

        {/* cursor */}
        {tooltipData && (
          <circle
            cx={tooltipLeft}
            cy={tooltipTop}
            r={4}
            fill="#2563eb"
            stroke="white"
            strokeWidth={2}
            pointerEvents="none"
          />
        )}

        {/* hover capture */}
        <rect
          x={margin.left}
          y={margin.top}
          width={width - margin.left - margin.right}
          height={height - margin.top - margin.bottom}
          fill="transparent"
          onMouseMove={(e) => {
            const point = localPoint(e);
            if (!point) return;

            const xVal = xScale.invert(point.x);

            const nearest = data.reduce((a, b) =>
              Math.abs(b.time - xVal) < Math.abs(a.time - xVal) ? b : a
            );

            showTooltip({
              tooltipData: nearest,
              tooltipLeft: xScale(nearest.time),
              tooltipTop: yScale(nearest.voltage),
            });
          }}
          onMouseLeave={hideTooltip}
        />
      </svg>

      {/* tooltip */}
      {tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          className="rounded-md bg-white px-4 py-2 text-sm shadow-lg border"
        >
          <div className="text-gray-500">
            t = {tooltipData.time}s
          </div>
          <div className="font-semibold">
            V = {tooltipData.voltage} V
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}
