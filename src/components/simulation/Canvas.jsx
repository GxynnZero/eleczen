"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useLiteSimStore } from '@/lib/simulation/state';
import ComponentNode from './ComponentNode';
import Wire from './Wire';
import { getComponentDef } from './StandardParts';
import { ContextMenu } from './ContextMenu';
import ActivityPanel from './ActivityPanel';
import LibraryBrowser from './LibraryBrowser';

const Canvas = ({ settings }) => {
    const {
        components, wires, selection,
        addComponent, updateComponentPosition, addWire, updateWirePoints,
        setSelection, removeSelection, runSimulation, clearCanvas,
        exportRequest, resolveExport,
        view, updateView // Use view from store
    } = useLiteSimStore();

    const svgRef = useRef(null);
    const [drag, setDrag] = useState(null); // { type: 'pan' | 'comp' | 'handle', id, index, startX, startY, origX, origY }
    const [wiring, setWiring] = useState(null); // { fromComp, fromPort, currX, currY }
    const [libraryOpen, setLibraryOpen] = useState(false); // For picking components and managing libraries
    const [contextMenu, setContextMenu] = useState(null); // { x, y, type, targetId }
    const [placingComponent, setPlacingComponent] = useState(null); // { type, model }
    const [junctions, setJunctions] = useState([]); // Array of {x, y}

    // Handle Export Requests
    useEffect(() => {
        if (exportRequest === 'PNG' && svgRef.current) {
            const svgData = new XMLSerializer().serializeToString(svgRef.current);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            // Get SVG dimensions (or use viewbox/window size)
            const width = svgRef.current.clientWidth || 1920;
            const height = svgRef.current.clientHeight || 1080;

            canvas.width = width;
            canvas.height = height;

            // Add dark background
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);

            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);

                const pngUrl = canvas.toDataURL("image/png");
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `circuit-${Date.now()}.png`;
                a.click();
                resolveExport();
            };
            img.src = url;
        }
    }, [exportRequest, resolveExport]);

    // Default settings if not provided
    const snapToGrid = settings?.snapToGrid ?? true;
    const showLabels = settings?.showLabels ?? true;

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(runSimulation, 100);
        return () => clearInterval(interval);
    }, [runSimulation]);

    // Auto-save initial wire paths
    useEffect(() => {
        wires.forEach(wire => {
            if (!wire.points) {
                const c1 = components.find(c => c.id === wire.fromComp);
                const c2 = components.find(c => c.id === wire.toComp);
                if (c1 && c2) {
                    const def1 = getComponentDef(c1.type);
                    const def2 = getComponentDef(c2.type);
                    const p1 = def1.ports.find(p => p.id === wire.fromPort);
                    const p2 = def2.ports.find(p => p.id === wire.toPort);
                    if (p1 && p2) {
                        const w1 = { x: c1.x + p1.x, y: c1.y + p1.y };
                        const w2 = { x: c2.x + p2.x, y: c2.y + p2.y };
                        const points = findPath(w1, w2, wire.id);
                        updateWirePoints(wire.id, points);
                    }
                }
            }
        });
    }, [wires, components, updateWirePoints]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                removeSelection();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [removeSelection]);

    // Coordinate conversion
    // Calculate Junctions
    useEffect(() => {
        const points = new Map(); // "x,y" -> count

        // Helper to add point
        const addPoint = (x, y) => {
            const key = `${x},${y}`;
            points.set(key, (points.get(key) || 0) + 1);
        };

        // Add all component ports
        components.forEach(c => {
            const def = getComponentDef(c.type);
            def.ports.forEach(p => {
                addPoint(c.x + p.x, c.y + p.y);
            });
        });

        // Add all wire endpoints and corners
        wires.forEach(w => {
            if (w.points) {
                w.points.forEach(p => addPoint(p.x, p.y));
            } else {
                // If no points yet (shouldn't happen often due to auto-calc), calc endpoints
                const c1 = components.find(c => c.id === w.fromComp);
                const c2 = components.find(c => c.id === w.toComp);
                if (c1 && c2) {
                    const def1 = getComponentDef(c1.type);
                    const def2 = getComponentDef(c2.type);
                    const p1 = def1.ports.find(p => p.id === w.fromPort);
                    const p2 = def2.ports.find(p => p.id === w.toPort);
                    addPoint(c1.x + p1.x, c1.y + p1.y);
                    addPoint(c2.x + p2.x, c2.y + p2.y);
                }
            }
        });

        // Filter for points with > 2 connections (junctions)
        const newJunctions = [];
        points.forEach((count, key) => {
            if (count > 2) {
                const [x, y] = key.split(',').map(Number);
                newJunctions.push({ x, y });
            }
        });

        setJunctions(newJunctions);
    }, [components, wires]);

    const screenToWorld = (sx, sy) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = sx;
        pt.y = sy;
        const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
        return {
            x: (svgP.x - view.x) / view.zoom,
            y: (svgP.y - view.y) / view.zoom
        };
    };

    // A* Pathfinding
    const findPath = (start, end, wireId = null) => {
        const gridSize = 10; // Match grid size
        const snap = (val) => Math.round(val / gridSize) * gridSize;

        const startNode = { x: snap(start.x), y: snap(start.y) };
        const endNode = { x: snap(end.x), y: snap(end.y) };

        const openList = [{ ...startNode, g: 0, h: 0, f: 0, parent: null }];
        const closedList = new Set();
        const closedKey = (n) => `${n.x},${n.y}`;

        // Heuristic (Manhattan)
        const getH = (n) => Math.abs(n.x - endNode.x) + Math.abs(n.y - endNode.y);

        // Obstacle check
        const isBlocked = (x, y) => {
            // Allow start and end points (ports)
            if ((Math.abs(x - startNode.x) < 1 && Math.abs(y - startNode.y) < 1) ||
                (Math.abs(x - endNode.x) < 1 && Math.abs(y - endNode.y) < 1)) return false;

            // Component Obstacles
            for (const comp of components) {
                const def = getComponentDef(comp.type);
                const w = (comp.width || def?.defaultSize?.width || 40);
                const h = (comp.height || def?.defaultSize?.height || 40);
                const padding = 10; // Clearance
                if (x >= comp.x - w / 2 - padding && x <= comp.x + w / 2 + padding &&
                    y >= comp.y - h / 2 - padding && y <= comp.y + h / 2 + padding) {
                    return true;
                }
            }
            return false;
        };

        let iterations = 0;
        const maxIterations = 1000;

        while (openList.length > 0 && iterations < maxIterations) {
            iterations++;

            // Get node with lowest f
            let lowInd = 0;
            for (let i = 0; i < openList.length; i++) {
                if (openList[i].f < openList[lowInd].f) { lowInd = i; }
            }
            let currentNode = openList[lowInd];

            // End case
            if (Math.abs(currentNode.x - endNode.x) < gridSize && Math.abs(currentNode.y - endNode.y) < gridSize) {
                let curr = currentNode;
                const path = [];
                while (curr.parent) {
                    path.push({ x: curr.x, y: curr.y });
                    curr = curr.parent;
                }
                path.push({ x: startNode.x, y: startNode.y });
                const fullPath = path.reverse().concat([{ x: endNode.x, y: endNode.y }]);

                // Simplify Path (Keep only corners)
                if (fullPath.length < 3) return fullPath;

                const simplified = [fullPath[0]];
                for (let i = 1; i < fullPath.length - 1; i++) {
                    const prev = fullPath[i - 1];
                    const curr = fullPath[i];
                    const next = fullPath[i + 1];

                    // If direction changes, keep the point
                    const dx1 = curr.x - prev.x;
                    const dy1 = curr.y - prev.y;
                    const dx2 = next.x - curr.x;
                    const dy2 = next.y - curr.y;

                    if (Math.sign(dx1) !== Math.sign(dx2) || Math.sign(dy1) !== Math.sign(dy2)) {
                        simplified.push(curr);
                    }
                }
                simplified.push(fullPath[fullPath.length - 1]);
                return simplified;
            }

            // Move current from open to closed
            openList.splice(lowInd, 1);
            closedList.add(closedKey(currentNode));

            // Neighbors (Up, Down, Left, Right)
            const neighbors = [
                { x: currentNode.x + gridSize, y: currentNode.y },
                { x: currentNode.x - gridSize, y: currentNode.y },
                { x: currentNode.x, y: currentNode.y + gridSize },
                { x: currentNode.x, y: currentNode.y - gridSize }
            ];

            for (let neighbor of neighbors) {
                if (closedList.has(closedKey(neighbor)) || isBlocked(neighbor.x, neighbor.y)) {
                    continue;
                }

                // Cost: distance + penalty for turns
                let gScore = currentNode.g + gridSize;
                if (currentNode.parent) {
                    if (currentNode.parent.x !== neighbor.x && currentNode.parent.y !== neighbor.y) {
                        gScore += gridSize * 2; // Penalty for turn
                    }
                }

                let neighborNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

                if (!neighborNode) {
                    neighborNode = { ...neighbor, g: gScore, h: getH(neighbor), f: 0, parent: currentNode };
                    neighborNode.f = neighborNode.g + neighborNode.h;
                    openList.push(neighborNode);
                } else if (gScore < neighborNode.g) {
                    neighborNode.g = gScore;
                    neighborNode.parent = currentNode;
                    neighborNode.f = neighborNode.g + neighborNode.h;
                }
            }
        }

        // Fallback: Orthogonal path
        const midX = (start.x + end.x) / 2;
        return [
            { x: start.x, y: start.y },
            { x: midX, y: start.y },
            { x: midX, y: end.y },
            { x: end.x, y: end.y }
        ];
    };

    // Helper to convert path points to SVG d string
    const getPathString = (points) => {
        if (!points || points.length === 0) return "";
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }
        return d;
    };

    const loadAndAddComponent = async (name, x, y) => {
        try {
            const { fetchAndLoadComponent, toLiteSimDef } = await import('@/lib/loader/ComponentLoader');
            const compDef = await fetchAndLoadComponent(name);

            if (compDef) {
                const liteSimDef = toLiteSimDef(compDef);

                addComponent(name, x, y, {
                    customDef: liteSimDef,
                    customPorts: liteSimDef.ports,
                    model: name
                });
            } else {
                console.error(`Failed to load component: ${name}`);
            }
        } catch (err) {
            console.error("Error loading component:", err);
        }
    };

    const handleMouseDown = (e) => {
        // Close context menu on click
        if (contextMenu) setContextMenu(null);

        // Place component if in placing mode
        if (placingComponent) {
            const pt = screenToWorld(e.clientX, e.clientY);
            let x = pt.x;
            let y = pt.y;
            if (snapToGrid) {
                x = Math.round(x / 10) * 10;
                y = Math.round(y / 10) * 10;
            }

            const def = getComponentDef(placingComponent.type);
            if (def) {
                addComponent(placingComponent.type, x, y, { model: placingComponent.model });
            } else {
                // Custom Component
                loadAndAddComponent(placingComponent.type, x, y);
            }

            setPlacingComponent(null);
            return;
        }

        // Pan start (Background click)
        if (e.button === 0) { // Left click only
            setDrag({ type: 'pan', startX: e.clientX, startY: e.clientY, origX: view.x, origY: view.y });
            // Deselect if clicking background
            if (e.target.tagName === 'svg') {
                setSelection(null);
            }
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type: 'canvas',
            targetId: null
        });
    };

    const handleCompMouseDown = (e, id) => {
        e.stopPropagation();

        // Check if clicked on a port
        if (e.target.dataset.portId) {
            const portId = e.target.dataset.portId;
            const pt = screenToWorld(e.clientX, e.clientY);
            setWiring({ fromComp: id, fromPort: portId, currX: pt.x, currY: pt.y });
            return;
        }

        const pt = screenToWorld(e.clientX, e.clientY);
        const comp = components.find(c => c.id === id);

        if (e.button === 2) { // Right click
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                type: 'component',
                targetId: id
            });
            return;
        }

        setSelection('component', id);
        setDrag({ type: 'comp', id, startX: pt.x, startY: pt.y, origX: comp.x, origY: comp.y });
    };

    // Helper: Distance from point p to line segment v-w
    const distanceToSegment = (p, v, w) => {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    };

    const handleHandleDoubleClick = (e, wireId, index) => {
        e.stopPropagation();
        const wire = wires.find(w => w.id === wireId);
        if (!wire || !wire.points) return;

        const newPoints = [...wire.points];
        newPoints.splice(index, 1);
        updateWirePoints(wireId, newPoints);
    };

    const handleWireDoubleClick = (e, wireId) => {
        e.stopPropagation();
        const pt = screenToWorld(e.clientX, e.clientY);
        const wire = wires.find(w => w.id === wireId);
        if (!wire || !wire.points) return;

        let minDist = Infinity;
        let insertIndex = -1;
        let newPoint = { x: pt.x, y: pt.y };

        if (snapToGrid) {
            newPoint.x = Math.round(newPoint.x / 20) * 20;
            newPoint.y = Math.round(newPoint.y / 20) * 20;
        }

        for (let i = 0; i < wire.points.length - 1; i++) {
            const p1 = wire.points[i];
            const p2 = wire.points[i + 1];
            const dist = distanceToSegment(pt, p1, p2);
            if (dist < minDist) {
                minDist = dist;
                insertIndex = i + 1;
            }
        }

        // Threshold to ensure we are clicking near the wire (e.g. 20px)
        if (insertIndex !== -1 && minDist < 20) {
            const newPoints = [...wire.points];
            newPoints.splice(insertIndex, 0, newPoint);
            updateWirePoints(wireId, newPoints);
        }
    };

    const handleHandleMouseDown = (e, wireId, index) => {
        e.stopPropagation();
        const pt = screenToWorld(e.clientX, e.clientY);
        const wire = wires.find(w => w.id === wireId);
        if (!wire || !wire.points) return;

        setDrag({
            type: 'handle',
            id: wireId,
            index,
            startX: pt.x,
            startY: pt.y,
            origX: wire.points[index].x,
            origY: wire.points[index].y
        });
    };

    const handleMouseMove = (e) => {
        if (wiring) {
            const pt = screenToWorld(e.clientX, e.clientY);

            // Snapping to ports
            const target = document.elementFromPoint(e.clientX, e.clientY);
            if (target && target.dataset.portId) {
                const compId = target.dataset.compId;
                const portId = target.dataset.portId;

                const comp = components.find(c => c.id === compId);
                if (comp) {
                    const def = getComponentDef(comp.type);
                    const port = def.ports.find(p => p.id === portId);
                    if (port) {
                        // Snap to port center
                        setWiring(prev => ({
                            ...prev,
                            currX: comp.x + port.x,
                            currY: comp.y + port.y
                        }));
                        return;
                    }
                }
            }

            // Snap to grid while wiring
            let wx = pt.x;
            let wy = pt.y;
            if (snapToGrid) {
                wx = Math.round(wx / 10) * 10;
                wy = Math.round(wy / 10) * 10;
            }

            setWiring(prev => ({ ...prev, currX: wx, currY: wy }));
            return;
        }

        if (!drag) return;

        if (drag.type === 'pan') {
            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;
            updateView({ x: drag.origX + dx, y: drag.origY + dy });
        } else if (drag.type === 'comp') {
            const pt = screenToWorld(e.clientX, e.clientY);
            const dx = pt.x - drag.startX;
            const dy = pt.y - drag.startY;

            let newX = drag.origX + dx;
            let newY = drag.origY + dy;

            if (snapToGrid) {
                newX = Math.round(newX / 10) * 10;
                newY = Math.round(newY / 10) * 10;
            }

            updateComponentPosition(drag.id, newX, newY);
        } else if (drag.type === 'handle') {
            const pt = screenToWorld(e.clientX, e.clientY);
            const dx = pt.x - drag.startX;
            const dy = pt.y - drag.startY;
            let newX = drag.origX + dx;
            let newY = drag.origY + dy;

            if (snapToGrid) {
                newX = Math.round(newX / 10) * 10;
                newY = Math.round(newY / 10) * 10;
            }

            const wire = wires.find(w => w.id === drag.id);
            if (wire && wire.points) {
                const newPoints = [...wire.points];
                // Prevent moving start/end points if they are connected (though handles shouldn't be shown for them)
                if (drag.index > 0 && drag.index < newPoints.length - 1) {
                    newPoints[drag.index] = { x: newX, y: newY };
                    updateWirePoints(drag.id, newPoints);
                }
            }
        }
    };

    const handleMouseUp = (e) => {
        // Update connected wires if component was moved
        if (drag && drag.type === 'comp') {
            const comp = components.find(c => c.id === drag.id);
            if (comp) {
                const def = getComponentDef(comp.type);
                wires.forEach(w => {
                    if (!w.points) return;
                    let newPoints = [...w.points];
                    let changed = false;

                    if (w.fromComp === comp.id) {
                        const port = def.ports.find(p => p.id === w.fromPort);
                        if (port) {
                            newPoints[0] = { x: comp.x + port.x, y: comp.y + port.y };
                            changed = true;
                        }
                    }
                    if (w.toComp === comp.id) {
                        const port = def.ports.find(p => p.id === w.toPort);
                        if (port) {
                            newPoints[newPoints.length - 1] = { x: comp.x + port.x, y: comp.y + port.y };
                            changed = true;
                        }
                    }

                    if (changed) {
                        updateWirePoints(w.id, newPoints);
                    }
                });
            }
        }

        if (wiring) {
            const target = document.elementFromPoint(e.clientX, e.clientY);

            // 1. Check for Port
            if (target && target.dataset.portId) {
                const toComp = target.dataset.compId;
                const toPort = target.dataset.portId;
                if (toComp !== wiring.fromComp) {
                    addWire(wiring.fromComp, wiring.fromPort, toComp, toPort);
                }
            }
            // 2. Check for Wire (Junction)
            else {
                const pt = screenToWorld(e.clientX, e.clientY);
                let wx = pt.x;
                let wy = pt.y;
                if (snapToGrid) {
                    wx = Math.round(wx / 10) * 10;
                    wy = Math.round(wy / 10) * 10;
                }

                // Check if we dropped on an existing wire
                for (const w of wires) {
                    if (!w.points) continue;
                    for (let i = 0; i < w.points.length - 1; i++) {
                        const p1 = w.points[i];
                        const p2 = w.points[i + 1];
                        // Simple distance check to segment
                        const dist = distanceToSegment({ x: wx, y: wy }, p1, p2);
                        if (dist < 5) {
                            // Split this wire!
                            // TODO: This requires a more complex store update to split a wire into two
                            // and insert a junction node. For now, we'll just log it.
                            console.log("Dropped on wire!", w.id);
                            // Ideally: create a "Node" component at (wx, wy) and connect both wires to it
                            break;
                        }
                    }
                }
            }
            setWiring(null);
        }
        setDrag(null);
    };

    const handleWheel = (e) => {
        // Simple zoom
        const newZoom = Math.max(0.1, Math.min(5, view.zoom - e.deltaY * 0.001));
        updateView({ zoom: newZoom });
    };

    // Handle Drop from Toolbar
    const handleDrop = (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('componentType');
        if (type) {
            const pt = screenToWorld(e.clientX, e.clientY);
            let x = pt.x;
            let y = pt.y;

            if (snapToGrid) {
                x = Math.round(x / 10) * 10;
                y = Math.round(y / 10) * 10;
            }
            addComponent(type, x, y);
        }
    };

    const handleContextAction = (action, payload) => {
        switch (action) {
            case 'place_component':
                setLibraryOpen(true);
                break;
            case 'delete':
            case 'delete_wire':
                if (payload.targetId) {
                    // TODO: Add removeComponent/removeWire to store or use removeSelection if selected
                    // For now, assuming selection logic handles it or we need new store methods
                    // We'll just select it and call removeSelection for simplicity
                    setSelection(payload.type, payload.targetId);
                    setTimeout(removeSelection, 0);
                }
                break;
            case 'run_simulation':
                runSimulation();
                break;
            case 'rotate':
                // TODO: Implement rotate in store
                console.log("Rotate not implemented yet");
                break;
            // ... other actions
        }
    };

    const handleLibrarySelect = (item) => {
        setLibraryOpen(false);
        // Enter placement mode
        setPlacingComponent({ type: item.type, model: item.name });
    };



    // Derive active devices from components on canvas + standard tools
    // For now, just show unique components present
    const activeDevices = React.useMemo(() => {
        const unique = new Map();
        components.forEach(c => {
            if (!unique.has(c.type)) {
                unique.set(c.type, { id: c.type, name: c.type, icon: '⚡' });
            }
        });
        return Array.from(unique.values());
    }, [components]);

    return (
        <div className="w-full h-full flex bg-gray-900 overflow-hidden relative">
            <ActivityPanel
                activeDevices={activeDevices}
                onSelectDevice={(device) => setPlacingComponent({ type: device.id })}
                onOpenLibrary={() => setLibraryOpen(true)}
                onPickComponent={() => setLibraryOpen(true)}
            />

            <LibraryBrowser
                isOpen={libraryOpen}
                onClose={() => setLibraryOpen(false)}
                onSelect={handleLibrarySelect}
            />
            <div
                className="flex-1 h-full relative"
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
            >
                {/* Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(#999 1px, transparent 1px), linear-gradient(90deg, #999 1px, transparent 1px)',
                        backgroundSize: `${20 * view.zoom}px ${20 * view.zoom}px`,
                        backgroundPosition: `${view.x}px ${view.y}px`
                    }}
                />

                <svg
                    ref={svgRef}
                    className="w-full h-full touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onContextMenu={handleContextMenu}
                    onWheel={handleWheel}
                    viewBox={`0 0 ${1000} ${1000}`}
                >
                    <g transform={`translate(${view.x}, ${view.y}) scale(${view.zoom})`}>
                        {/* Wires */}
                        {wires.map(wire => {
                            const c1 = components.find(c => c.id === wire.fromComp);
                            const c2 = components.find(c => c.id === wire.toComp);
                            if (!c1 || !c2) return null;

                            const def1 = getComponentDef(c1.type);
                            const def2 = getComponentDef(c2.type);
                            const p1 = def1.ports.find(p => p.id === wire.fromPort);
                            const p2 = def2.ports.find(p => p.id === wire.toPort);

                            const w1 = { x: c1.x + p1.x, y: c1.y + p1.y };
                            const w2 = { x: c2.x + p2.x, y: c2.y + p2.y };

                            // Use existing points or calculate new path
                            let points = wire.points ? [...wire.points] : null;
                            if (!points) {
                                points = findPath(w1, w2, wire.id);
                                // Save calculated path immediately so it persists
                                // We need to do this in a useEffect or similar to avoid render loop
                                // But for now, let's just use the calculated points for rendering
                                // AND trigger an update if it's a new wire (handled in useEffect below)
                            } else {
                                if (points.length > 0) {
                                    points[0] = w1;
                                    points[points.length - 1] = w2;
                                }
                            }

                            const pathString = getPathString(points);
                            const isSelected = selection?.type === 'wire' && selection?.id === wire.id;

                            return (
                                <g key={wire.id}>
                                    <Wire
                                        wire={wire}
                                        fromPos={w1}
                                        toPos={w2}
                                        path={pathString}
                                        active={Math.abs(c1.state?.current || 0) > 1e-6 || Math.abs(c2.state?.current || 0) > 1e-6}
                                        current={Math.max(Math.abs(c1.state?.current || 0), Math.abs(c2.state?.current || 0))}
                                        isSelected={isSelected}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setSelection('wire', wire.id);
                                            // If wire has no points yet, save the current calculated path so it becomes editable
                                            if (!wire.points) {
                                                updateWirePoints(wire.id, points);
                                            }
                                        }}
                                        onDoubleClick={(e) => handleWireDoubleClick(e, wire.id)}
                                    />
                                    {/* Render Handles if Selected */}
                                    {isSelected && points && points.map((pt, i) => {
                                        // Don't show handles for start/end (they are attached to ports)

                                        return (
                                            <circle
                                                key={i}
                                                cx={pt.x}
                                                cy={pt.y}
                                                r={4 / view.zoom}
                                                fill="#0ff"
                                                stroke="#000"
                                                strokeWidth={1 / view.zoom}
                                                className="cursor-pointer hover:r-6 transition-all"
                                                onMouseDown={(e) => handleHandleMouseDown(e, wire.id, i)}
                                                onDoubleClick={(e) => handleHandleDoubleClick(e, wire.id, i)}
                                            />
                                        );
                                    })}
                                </g>
                            );
                        })}

                        {/* Components */}
                        {components.map(comp => (
                            <ComponentNode
                                key={comp.id}
                                component={comp}
                                isSelected={selection?.id === comp.id}
                                onMouseDown={handleCompMouseDown}
                                showLabels={showLabels}
                            />
                        ))}

                        {/* Junctions */}
                        {junctions.map((j, i) => (
                            <circle
                                key={`j-${i}`}
                                cx={j.x}
                                cy={j.y}
                                r={4 / view.zoom}
                                fill="#0ff"
                                className="pointer-events-none"
                            />
                        ))}

                        {/* Wiring Line */}
                        {wiring && (
                            <path
                                d={getPathString(findPath(
                                    (() => {
                                        const c = components.find(c => c.id === wiring.fromComp);
                                        const def = getComponentDef(c.type);
                                        const p = def.ports.find(p => p.id === wiring.fromPort);
                                        return { x: c.x + p.x, y: c.y + p.y };
                                    })(),
                                    { x: wiring.currX, y: wiring.currY }
                                ))}
                                stroke="#0ff" strokeWidth="2" strokeDasharray="5 5" fill="none"
                                className="pointer-events-none"
                            />
                        )}
                    </g>
                </svg>


            </div>

            {
                contextMenu && (
                    <ContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        type={contextMenu.type}
                        targetId={contextMenu.targetId}
                        onClose={() => setContextMenu(null)}
                        onAction={handleContextAction}
                    />
                )
            }
        </div >
    );
};

export default Canvas;
