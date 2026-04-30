import TopBar from './topbar'
import ToolBar from './toolbar'
import PropertiesPanel from './properties'
import Canvas from './Canvas'
import ComponentsPanel from './components'
import ToolsPanel from './tools'
import { BatteryCharging, Lightbulb, WavesHorizontal, Zap } from 'lucide-solid'

const icons = {
    battery: BatteryCharging,
    resistor: Zap,
    led: Lightbulb,
    capacitor: WavesHorizontal,
    switch: Lightbulb,
};

import ConsolePanel from './ConsolePanel'

export {
    TopBar,
    ToolBar,
    PropertiesPanel,
    Canvas,
    ComponentsPanel,
    ConsolePanel,
    ToolsPanel,
    icons
}