import { Zap } from "lucide-solid";
import { icons } from ".";
import { components, selectComponent } from "../utils/simulation";
import Library from "./library";
import MiniMap from "./miniMap";

const ComponentsPanel = () => {
    return (
        <aside class="panel library h-full">
            <MiniMap />

            <Library />

            <div class="panel-title compact">Parts On Board</div>

            <div class="component-list">
                <For each={components()}>
                    {(component) => {
                        const Icon = icons[component.type] || Zap;

                        return (
                            <button
                                class="component-row"
                                onClick={() => selectComponent(component.id)}
                            >
                                <Icon size={14} />
                                <span>{component.id}</span>
                            </button>
                        );
                    }}
                </For>
            </div>
        </aside>
    );
}

export default ComponentsPanel;