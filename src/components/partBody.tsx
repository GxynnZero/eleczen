import { JSX } from "solid-js";
import { Component as CircuitComponent } from "~/types";

type SymbolProps = {
  component: CircuitComponent;
};

type SymbolRenderer = (props: SymbolProps) => JSX.Element;

export const SYMBOLS: Record<string, SymbolRenderer> = {
  battery: () => (
    <g class="symbol">
      <line x1="-56" y1="0" x2="-18" y2="0" />
      <line x1="18" y1="0" x2="56" y2="0" />
      <line x1="-18" y1="-26" x2="-18" y2="26" />
      <line x1="6" y1="-16" x2="6" y2="16" />
      <text x="-21" y="-34" class="symbol-text">+</text>
      <text x="3" y="-34" class="symbol-text">-</text>
    </g>
  ),

  led: (props) => {
    const active = () => props.component.state?.active;

    return (
      <g class={`symbol ${active() ? "symbol-hot" : ""}`}>
        <line x1="-54" y1="0" x2="-22" y2="0" />
        <line x1="24" y1="0" x2="54" y2="0" />
        <polygon points="-22,-24 -22,24 20,0" />
        <line x1="24" y1="-24" x2="24" y2="24" />
        <line x1="8" y1="-30" x2="25" y2="-47" />
        <line x1="24" y1="-30" x2="41" y2="-47" />
      </g>
    );
  },

  capacitor: () => (
    <g class="symbol">
      <line x1="-54" y1="0" x2="-15" y2="0" />
      <line x1="15" y1="0" x2="54" y2="0" />
      <line x1="-15" y1="-27" x2="-15" y2="27" />
      <line x1="15" y1="-27" x2="15" y2="27" />
    </g>
  ),
};

SYMBOLS["resistor"] = () => (
  <g class="symbol">
    <line x1="-60" y1="0" x2="-38" y2="0" />
    <polyline points="-38,0 -28,-16 -12,16 4,-16 20,16 36,0" />
    <line x1="36" y1="0" x2="60" y2="0" />
  </g>
);

export function PartBody(props: SymbolProps) {
  const type = props.component.type;
  const Symbol = SYMBOLS[type] || SYMBOLS["resistor"];

  return <Symbol component={props.component} />;
}