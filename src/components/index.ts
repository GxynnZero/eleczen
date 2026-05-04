import TopBar from './topbar';
import ToolBar from './toolbar';
import PropertiesPanel from './properties';
import Canvas from './Canvas';
import ComponentsPanel from './components';
import ToolsPanel from './tools';
import ConsolePanel from './ConsolePanel';
import CloudLibrary from './cloudLibrary';
import CloudProjectsModal from './cloudProjects';
import {
    BatteryCharging,
    Lightbulb,
    WavesHorizontal,
    Zap,
    Waves,
    Triangle,
    Activity,
    Cpu,
    CircuitBoard,
    Gauge,
    PlugZap,
    Radio,
    ChevronDown,
} from 'lucide-solid';

// Icon map for all component types (library, panel, etc.)
const icons = {
    battery:    BatteryCharging,
    resistor:   Zap,
    led:        Lightbulb,
    capacitor:  WavesHorizontal,
    switch:     PlugZap,
    // ── New types ─────────────────────────────────────────────
    inductor:   Waves,
    diode:      Triangle,
    zener:      Activity,
    npn:        Cpu,
    pnp:        Cpu,
    mosfet_n:   CircuitBoard,
    voltmeter:  Gauge,
    ground:     ChevronDown,
};

export {
    TopBar,
    ToolBar,
    PropertiesPanel,
    Canvas,
    ComponentsPanel,
    ConsolePanel,
    ToolsPanel,
    CloudLibrary,
    CloudProjectsModal,
    icons,
};