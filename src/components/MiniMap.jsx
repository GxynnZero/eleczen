import { createEffect, onCleanup, onMount } from 'solid-js';
import { components, portPoint, wires } from '../utils/simulation/index.js';

const WORLD = { width: 900, height: 560 };

export default function MiniMap() {
  let root;
  let app;
  let graphic;
  let viewportLayer;

  const terminalPoint = (terminal) => {
    const component = components().find((item) => item.id === terminal.componentId);
    return component ? portPoint(component, terminal.portId) : { x: 0, y: 0 };
  };

  const draw = () => {
    if (!graphic) return;

    graphic.clear();
    graphic.rect(0, 0, WORLD.width, WORLD.height).fill({ color: 0x0b0f12 });
    graphic.setStrokeStyle({ width: 2, color: 0x64d6ca, alpha: 0.8 });

    for (const wire of wires()) {
      const from = terminalPoint(wire.from);
      const to = terminalPoint(wire.to);
      graphic.moveTo(from.x, from.y);
      graphic.lineTo(to.x, to.y);
    }

    graphic.stroke();

    for (const component of components()) {
      graphic
        .roundRect(component.x - 34, component.y - 18, 68, 36, 6)
        .fill({ color: component.state?.active ? 0xf6c85f : 0x24303d, alpha: 0.95 })
        .stroke({ width: 2, color: component.state?.active ? 0xffe49a : 0x64748b, alpha: 0.85 });
    }
  };

  onMount(async () => {
    const [{ Application, Graphics }, { Viewport }] = await Promise.all([
      import('pixi.js'),
      import('pixi-viewport')
    ]);

    app = new Application();

    await app.init({
      resizeTo: root,
      backgroundAlpha: 0,
      antialias: true,
    });

    root.appendChild(app.canvas);

    viewportLayer = new Viewport({
      screenWidth: root.clientWidth,
      screenHeight: root.clientHeight,
      worldWidth: WORLD.width,
      worldHeight: WORLD.height,
      events: app.renderer.events,
    });
    app.stage.addChild(viewportLayer);
    viewportLayer.fitWorld();

    graphic = new Graphics();
    viewportLayer.addChild(graphic);
    draw();
  });

  createEffect(() => {
    components();
    wires();
    draw();
  });

  onCleanup(() => {
    if (!app) return;
    try {
      app.destroy(true, { children: true, texture: true, baseTexture: true });
    } catch (error) {
      console.warn('MiniMap cleanup failed:', error);
    }
  });

  return (
    <section class="panel minimap-panel">
      <div ref={root} class="pixi-minimap" />
    </section>
  );
}
