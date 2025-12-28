"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { globalModelStore } from '@/lib/simulation/modelStore';
import { supabase } from '../../../supabase/supabase';
import { Search, Package, Server, Upload, X, Cpu, HardDrive, Battery, Zap, Activity, RefreshCw } from 'lucide-react';


const CATEGORIES = [
    { id: 'all', label: 'All Components', icon: Package },
    { id: 'passive', label: 'Passives', icon: Activity },
    { id: 'semicon', label: 'Semiconductors', icon: Cpu },
    { id: 'source', label: 'Sources', icon: Battery },
    { id: 'ic', label: 'Integrated Circuits', icon: HardDrive },
    { id: 'mech', label: 'Electromechanical', icon: Server }
];



const LibraryBrowser = ({ isOpen, onClose, onSelect }) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [models, setModels] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'manage'

    // Upload State
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const abortControllerRef = useRef(null);

    // Initial Load
    useEffect(() => {
        if (isOpen) {
            loadItems();
        }
    }, [isOpen]);

    const loadItems = async () => {
        // Load only real components from database
        let items = [];

        // Fetch uploaded components from Supabase
        try {
            const { data, error } = await supabase
                .from('library_index')
                .select('name, type, category, source_file')
                .order('name');

            // Handle DB fetch and fallback
            let sourceData = data || [];
            let isStorage = false;

            if (error || sourceData.length === 0) {
                // console.log('Fetching from storage fallback...');
                const { data: files } = await supabase.storage.from('libraries').list('components');
                if (files) {
                    sourceData = files.filter(f => f.name !== '.emptyFolderPlaceholder');
                    isStorage = true;
                }
            }

            if (sourceData.length > 0) {
                const remoteItems = sourceData.map(d => {
                    if (isStorage) {
                        // Simple mapping for storage files
                        return {
                            name: d.name,
                            type: d.type,
                            category: d.category,
                            source: 'storage',
                            symbol: '⚡'
                        };
                    }

                    // Map to our category system
                    let cat = 'passive';
                    if (d.category) {
                        const c = d.category.toLowerCase();
                        if (c.includes('ic') || c.includes('timer') || c.includes('opamp')) cat = 'ic';
                        else if (c.includes('semicon') || c.includes('transistor') || c.includes('diode')) cat = 'semicon';
                        else if (c.includes('source') || c.includes('power')) cat = 'source';
                        else if (c.includes('mech') || c.includes('switch')) cat = 'mech';
                    }

                    // Determine symbol
                    let sym = '⚡';
                    const t = (d.type || '').toLowerCase();
                    if (t.includes('resistor')) sym = 'R';
                    else if (t.includes('capacitor')) sym = 'C';
                    else if (t.includes('inductor')) sym = 'L';
                    else if (t.includes('diode')) sym = 'D';
                    else if (t.includes('transistor')) sym = 'Q';
                    else if (t.includes('ic')) sym = 'U';
                    else if (t.includes('subckt')) sym = 'X';

                    return {
                        name: d.name,
                        type: d.type || 'component',
                        category: cat,
                        source: 'database',
                        symbol: sym
                    };
                });
                items = [...items, ...remoteItems];
                // console.log(`✓ Loaded components: ${remoteItems.length}`);
            }
        } catch (err) {
            console.warn('Database not available:', err.message || 'Unknown error');
            // Continue with standard components only
        }
        setModels(items);
    };

    const filteredItems = useMemo(() => {
        return models.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === 'all' || item.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [models, search, category]);

    // --- Upload Logic (Ported from LibraryManager) ---
    const handleFileSelect = (e) => {
        setUploadFiles(Array.from(e.target.files));
        setUploadProgress(0);
        setUploadStatus('');
    };

    const checkCancelled = () => {
        if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Cancelled by user');
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setUploadStatus('Cancelled');
            setIsUploading(false);
        }
    };

    const handleUpload = async () => {
        setIsUploading(true);
        setUploadStatus('Starting upload...');
        setUploadProgress(0);
        abortControllerRef.current = new AbortController();

        try {
            const { ComponentProcessor } = await import('@/lib/processing/converter');
            const processor = new ComponentProcessor();
            const totalFiles = uploadFiles.length;

            for (let i = 0; i < totalFiles; i++) {
                const file = uploadFiles[i];
                checkCancelled();

                if (file.name.endsWith('.zip')) {
                    setUploadStatus(`Reading ${file.name}...`);
                    const JSZip = (await import('jszip')).default;
                    const zip = new JSZip();
                    const contents = await zip.loadAsync(file);

                    checkCancelled();

                    const filesToProcess = [];
                    const entries = Object.entries(contents.files);

                    setUploadStatus(`Extracting ${file.name}...`);
                    for (const [relativePath, zipEntry] of entries) {
                        if (zipEntry.dir || relativePath.startsWith('__MACOSX')) continue;

                        const fileName = relativePath.split('/').pop();
                        if (fileName.match(/\.(kicad_sym|sub|mod|cir|asy|lib)$/)) {
                            const text = await zipEntry.async('string');
                            filesToProcess.push({ name: fileName, content: text });
                        }
                    }

                    checkCancelled();
                    setUploadStatus(`Processing ${filesToProcess.length} files in ${file.name}...`);

                    const libraryName = file.name.replace('.zip', '');
                    const { ezc, ezl, svg } = processor.processLibrary(filesToProcess, libraryName);

                    await uploadProcessedFiles(ezc, ezl, svg, libraryName, (progress) => {
                        const fileShare = 100 / totalFiles;
                        const currentBase = (i * fileShare);
                        const actualProgress = currentBase + (progress * (fileShare / 100));
                        setUploadProgress(Math.round(actualProgress));
                    });

                } else {
                    // Single file handling
                    setUploadStatus(`Processing ${file.name}...`);
                    const text = await file.text();
                    const filesToProcess = [{ name: file.name, content: text }];
                    const libraryName = file.name.split('.')[0];
                    const { ezc, ezl, svg } = processor.processLibrary(filesToProcess, libraryName);

                    await uploadProcessedFiles(ezc, ezl, svg, libraryName, (progress) => {
                        const fileShare = 100 / totalFiles;
                        const currentBase = (i * fileShare);
                        const actualProgress = currentBase + (progress * (fileShare / 100));
                        setUploadProgress(Math.round(actualProgress));
                    });
                }
            }

            setUploadStatus('Upload complete!');
            setUploadProgress(100);
            setTimeout(() => {
                setUploadStatus('');
                setUploadFiles([]);
                setActiveTab('browse');
                loadItems(); // Refresh library
            }, 1000);

        } catch (error) {
            if (error.message === 'Cancelled by user') {
                setUploadStatus('Upload cancelled');
            } else {
                console.error(error);
                setUploadStatus('Error: ' + error.message);
            }
        } finally {
            setIsUploading(false);
            abortControllerRef.current = null;
        }
    };

    const uploadProcessedFiles = async (ezc, ezl, svg, libraryName, onProgress) => {
        // Parse the EZL to find components to upload separately
        // Note: The processor returns { ezc, ezl, svg } strings. 
        // We need to parse the JSON EZC/EZL to upload individual parts.

        // However, for this optimized version, let's assume `processor.processLibrary` 
        // returns the necessary data structures or we re-parse them.
        // The previous implementation assumed `components` availability which matched the `ComponentProcessor` output logic.
        // Let's implement a robust upload helper. mainly focusing on the output files.

        let processed = 0;
        const totalSteps = 3; // EZC, EZL, SVG for the library (simplified for now)

        // 1. Upload EZC Library Blob
        const ezcBlob = new Blob([ezc], { type: 'text/plain' });
        const ezcPath = `components/${libraryName}/${libraryName}.ezc`;
        await supabase.storage.from('libraries').upload(ezcPath, ezcBlob, { upsert: true });

        // Index it
        await fetch('/api/library/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filePath: ezcPath,
                originalName: `${libraryName}.ezc`,
                size: ezcBlob.size,
                componentName: libraryName,
                libraryName: libraryName,
                type: 'ezc'
            })
        });
        processed++;
        onProgress && onProgress((processed / totalSteps) * 100);

        // 2. Upload EZL Index
        const ezlBlob = new Blob([ezl], { type: 'text/plain' });
        const ezlPath = `components/${libraryName}/${libraryName}.ezl`;
        await supabase.storage.from('libraries').upload(ezlPath, ezlBlob, { upsert: true });
        processed++;
        onProgress && onProgress((processed / totalSteps) * 100);

        // 3. Upload SVG Preview
        if (svg) {
            const svgBlob = new Blob([svg], { type: 'text/plain' });
            const svgPath = `components/${libraryName}/${libraryName}.svg`;
            await supabase.storage.from('libraries').upload(svgPath, svgBlob, { upsert: true });

            await fetch('/api/library/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filePath: svgPath,
                    originalName: `${libraryName}.svg`,
                    size: svgBlob.size,
                    libraryName: libraryName,
                    type: 'svg'
                })
            });
        }
        processed++;
        onProgress && onProgress(100);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-[900px] h-[600px] max-w-[90vw] max-h-[85vh] bg-black/90 border border-white/10 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-xl">
                {/* Top Glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />

                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-neon-blue/10 rounded-lg border border-neon-blue/20">
                            <Package className="w-5 h-5 text-neon-blue" />
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-wide">COMPONENT LIBRARY</h2>
                    </div>

                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'browse' ? 'bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            Browse
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'manage' ? 'bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            Manage
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => loadItems()}
                            className="p-2 text-gray-400 hover:text-neon-blue hover:bg-white/10 rounded-lg transition-all hover:rotate-180 duration-500"
                            title="Refresh library"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                {activeTab === 'browse' ? (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left: Categories (Proteus Tree Style) */}
                        <div className="w-64 bg-black/40 border-r border-white/10 p-4 overflow-y-auto">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Categories</h3>
                            <div className="space-y-1">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${category === cat.id
                                            ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <cat.icon className="w-4 h-4" />
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Middle: Component List (Grid) */}
                        <div className="flex-1 flex flex-col min-w-0 bg-black/20">
                            {/* Search Bar */}
                            <div className="p-4 border-b border-white/10 flex gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search components..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 outline-none transition-all placeholder:text-gray-600"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="flex-1 overflow-y-auto p-4 content-start grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedItem(item)}
                                        onDoubleClick={() => onSelect(item)}
                                        className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left group ${selectedItem === item
                                            ? 'bg-neon-blue/10 border-neon-blue/50 shadow-[0_0_15px_rgba(0,243,255,0.15)]'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="font-bold text-sm text-white group-hover:text-neon-blue transition-colors mb-1">{item.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{item.category}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Preview Panel (Proteus Preview) */}
                        <div className="w-80 bg-black/40 border-l border-white/10 flex flex-col">
                            {selectedItem ? (
                                <>
                                    <div className="p-6 border-b border-white/10 flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)] relative min-h-[240px]">
                                        {/* Symbol Placeholder */}
                                        <div className="text-6xl font-serif text-neon-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                                            {selectedItem.symbol || '?'}
                                        </div>
                                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded border border-white/10 bg-black/30 text-[10px] text-gray-500 uppercase">
                                            {selectedItem.source}
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{selectedItem.name}</h3>
                                            <div className="text-xs text-gray-400 font-mono">{selectedItem.type}</div>
                                        </div>

                                        {selectedItem.params && (
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Parameters</div>
                                                <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-xs font-mono text-gray-300">
                                                    {Object.entries(selectedItem.params).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between">
                                                            <span className="text-gray-500">{k}:</span>
                                                            <span className="text-neon-blue">{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => onSelect(selectedItem)}
                                            className="w-full py-3 bg-neon-blue text-black font-bold text-sm rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(0,243,255,0.3)] mt-auto"
                                        >
                                            Place Component
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                                    <Zap className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-sm">Select a component to view details and preview.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Manage / Upload Tab */
                    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-black/20">
                        <div className="w-full max-w-2xl border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center hover:border-neon-blue/30 hover:bg-neon-blue/5 transition-all group cursor-pointer relative">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                            <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-neon-blue transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Upload Libraries</h3>
                            <p className="text-gray-500 text-sm text-center max-w-md">
                                Drag and drop your library files here, or click to browse.<br />
                                Supports .kicad_sym, .lib, .sub, .zip
                            </p>
                        </div>

                        {uploadFiles.length > 0 && (
                            <div className="w-full max-w-2xl mt-8 bg-black/40 border border-white/10 rounded-xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-white">{uploadFiles.length} files selected</span>
                                    {isUploading && <span className="text-xs text-neon-blue animate-pulse">{uploadStatus}</span>}
                                </div>

                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                                    <div
                                        className="h-full bg-neon-blue transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setUploadFiles([])}
                                        disabled={isUploading}
                                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className="px-6 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/50 rounded-lg text-xs font-bold hover:bg-neon-blue hover:text-black transition-all disabled:opacity-50"
                                    >
                                        {isUploading ? 'Uploading...' : 'Start Upload'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryBrowser;
