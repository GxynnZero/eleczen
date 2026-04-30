import { Cable, Eraser, MousePointer2, Move, Edit3 } from "lucide-solid";
import { setOption, settings } from "../store/state";

function ToolButton(props) {
    const Icon = props.icon;

    return (
        <button
            class={settings().tool === props.value ? 'active' : ''}
            onClick={() => setOption('tool', props.value)}
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
                <ToolButton value="wire" icon={Cable} />
                <ToolButton value="wire-edit" icon={Edit3} />
                <ToolButton value="pan" icon={Move} />
                <ToolButton value="delete" icon={Eraser} />
            </div>
        </section>
    );
}

export default ToolsPanel;