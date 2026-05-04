import { Cable, Eraser, MousePointer2, Move, Edit3, Activity, Pen, Play } from "lucide-solid";
import { setOption, settings, runSimulation } from "../utils/simulation";

function ToolButton(props) {
    const Icon = props.icon;

    const handleClick = () => {
        setOption('tool', props.value);
        if (props.value === 'run') {
            runSimulation();
        }
    };

    return (
        <button
            class={settings().tool === props.value ? 'active' : ''}
            onClick={handleClick}
        >
            <Icon size={16} />
        </button>
    );
}

const ToolsPanel = () => {
    return (
        <section class="actions p-2">
            <div class="tool-grid">
                <ToolButton value="select" icon={MousePointer2} />
                <ToolButton value="edit" icon={Pen} />
                <ToolButton value="run" icon={Activity} />
            </div>
        </section>
    );
}

export default ToolsPanel;