'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabase/supabase';
import { fetchAndLoadComponent } from '@/lib/loader/ComponentLoader';
import { Loader2, RefreshCw, Database, Code, Image as ImageIcon } from 'lucide-react';

export default function TestComponentsPage() {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [componentData, setComponentData] = useState(null);
    const [loadingComponent, setLoadingComponent] = useState(false);
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);

    const addLog = (msg, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] [${type.toUpperCase()}] ${msg}`, ...prev]);
    };

    const fetchComponents = async () => {
        setLoading(true);
        setError(null);
        addLog('Fetching components from Supabase Storage (libraries bucket)...');

        try {
            // List folders in 'components' directory
            const { data, error } = await supabase
                .storage
                .from('libraries')
                .list('components', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                });

            if (error) {
                throw error;
            }

            // Map folders to component objects
            // Assuming structure: components/{ComponentName}/...
            const items = (data || [])
                .filter(item => item.id === null) // Folders have id: null in some versions, or check metadata
                // Actually, .list returns files and folders. Folders usually don't have metadata.mimetype
                // Let's assume all items in 'components/' are component folders or files.
                // Better heuristic: Filter out system files like .emptyFolderPlaceholder
                .filter(item => item.name !== '.emptyFolderPlaceholder')
                .map(item => ({
                    id: item.name, // Use name as ID for storage-based items
                    name: item.name,
                    type: 'component', // Generic type since we lack DB metadata
                    category: 'storage',
                    source: 'storage',
                    // Construct path for loading knowing standard structure
                    source_file: `components/${item.name}/${item.name}.ezc`
                }));

            setComponents(items);
            addLog(`Successfully found ${items.length} components in storage.`, 'success');
        } catch (err) {
            console.error(err);
            setError(err.message);
            addLog(`Error listing storage: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadComponentDetails = async (component) => {
        setSelectedComponent(component);
        setComponentData(null);
        setLoadingComponent(true);
        addLog(`Loading details for ${component.name}...`);

        try {
            // First clear cache to ensure fresh fetch
            // globalComponentLoader.clearCache();
            addLog('Cleared component loader cache (stateless now).');

            const data = await fetchAndLoadComponent(component.name);
            if (data) {
                setComponentData(data);
                addLog(`Successfully loaded component ${component.name}`, 'success');
                if (data.svgPreview) {
                    addLog('SVG preview loaded successfully.', 'success');
                } else {
                    addLog('No SVG preview returned.', 'warning');
                }
            } else {
                addLog(`ComponentLoader returned null for ${component.name}`, 'error');
            }
        } catch (err) {
            console.error(err);
            addLog(`Error loading component details: ${err.message}`, 'error');
        } finally {
            setLoadingComponent(false);
        }
    };

    useEffect(() => {
        fetchComponents();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="mb-8 border-b border-white/10 pb-4">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Database className="text-neon-blue" />
                    Supabase Component Fetch Test
                </h1>
                <p className="text-gray-400 mt-2">
                    Verify database connection, table structure, and component loading logic.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Component List */}
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h2 className="font-semibold">Libraries Table</h2>
                        <button
                            onClick={fetchComponents}
                            disabled={loading}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading && (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        )}

                        {!loading && components.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No components found in libraries table.
                            </div>
                        )}

                        {components.map(comp => (
                            <button
                                key={comp.id}
                                onClick={() => loadComponentDetails(comp)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedComponent?.id === comp.id
                                    ? 'bg-neon-blue/10 border-neon-blue text-neon-blue'
                                    : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="font-medium">{comp.name}</div>
                                <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{comp.type}</span>
                                    <span>{comp.category}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Middle Panel: Component Details */}
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h2 className="font-semibold">Component Details</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {!selectedComponent ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                Select a component to view details
                            </div>
                        ) : loadingComponent ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
                                <span>Loading full component data...</span>
                            </div>
                        ) : componentData ? (
                            <div className="space-y-6">
                                {/* SVG Preview */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" /> SVG Preview
                                    </h3>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-center min-h-[150px]">
                                        {componentData.svgPreview ? (
                                            <div
                                                dangerouslySetInnerHTML={{ __html: componentData.svgPreview }}
                                                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[200px]"
                                            />
                                        ) : (
                                            <span className="text-gray-500">No SVG available</span>
                                        )}
                                    </div>
                                </div>

                                {/* Raw Data */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                        <Code className="w-4 h-4" /> Parsed Data
                                    </h3>
                                    <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto text-xs text-green-400 font-mono border border-white/5">
                                        {JSON.stringify(componentData, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="text-red-400 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                                Failed to load component data.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Logs */}
                <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h2 className="font-semibold font-mono text-sm">Execution Logs</h2>
                        <button
                            onClick={() => setLogs([])}
                            className="text-xs text-gray-400 hover:text-white"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
                        {logs.map((log, i) => (
                            <div key={i} className={`
                                ${log.includes('[ERROR]') ? 'text-red-400' : ''}
                                ${log.includes('[SUCCESS]') ? 'text-green-400' : ''}
                                ${log.includes('[WARNING]') ? 'text-yellow-400' : ''}
                                ${log.includes('[INFO]') ? 'text-gray-400' : ''}
                            `}>
                                {log}
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-gray-600 italic">Waiting for actions...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
