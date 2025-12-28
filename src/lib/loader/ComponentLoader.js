import { globalModelStore } from '../simulation/modelStore.js';
import { parseEZC, parseEZL } from '../parser/project.js';

export const loadComponent = (ezcContent, ezlContent) => {
    // 1. Parse EZC
    const ezc = parseEZC(ezcContent);
    if (ezc.name) {
        globalModelStore.registerComponent(ezc.name, ezc);
    }

    // 2. Parse EZL (if provided)
    if (ezlContent) {
        const ezl = parseEZL(ezlContent);
        ezl.submodels.forEach(modelContent => {
            const cleanContent = modelContent.trim();
            // Heuristic to find name in content
            const lines = cleanContent.split('\n');
            let name = null;
            let type = null;

            const subcktLine = lines.find(l => l.trim().toLowerCase().startsWith('.subckt'));
            const modelLine = lines.find(l => l.trim().toLowerCase().startsWith('.model'));

            if (subcktLine) {
                const parts = subcktLine.trim().split(/\s+/);
                name = parts[1];
                type = 'subckt';
            } else if (modelLine) {
                const parts = modelLine.trim().split(/\s+/);
                name = parts[1];
                type = 'model';
            }

            if (name) {
                globalModelStore.registerModel(name, cleanContent, type);
                console.log(`Registered model: ${name} (${type})`);
            } else {
                console.warn("Could not identify model name in block:", cleanContent.substring(0, 50) + "...");
            }
        });
    }

    return ezc;
};

// Helper to fetch and load
export const fetchAndLoadComponent = async (name) => {
    // 1. Try to find in ModelStore first (if already loaded)
    // TODO: Add check if we want to avoid refetching

    // 2. Fetch from DB/Storage
    // We need to import supabase dynamically or path correctly
    const { supabase } = await import('../../../supabase/supabase.js'); // Adjust path as needed

    // Check DB first
    const { data: dbData } = await supabase
        .from('library_index')
        .select('*')
        .eq('name', name)
        .single();

    let ezcContent = null;
    let ezlContent = null;
    let svgContent = null;

    if (dbData) {
        // Download from storage
        const ezcPath = `components/${name}/${name}.ezc`;
        const ezlPath = `components/${name}/${name}.ezl`;
        const svgPath = `components/${name}/${name}.svg`;

        const { data: ezcBlob } = await supabase.storage.from('libraries').download(ezcPath);
        if (ezcBlob) ezcContent = await ezcBlob.text();

        const { data: ezlBlob } = await supabase.storage.from('libraries').download(ezlPath);
        if (ezlBlob) ezlContent = await ezlBlob.text();

        const { data: svgBlob } = await supabase.storage.from('libraries').download(svgPath);
        if (svgBlob) svgContent = await svgBlob.text();
    } else {
        // Try direct storage fallback
        const ezcPath = `components/${name}/${name}.ezc`;
        const ezlPath = `components/${name}/${name}.ezl`;
        const svgPath = `components/${name}/${name}.svg`;

        const { data: ezcBlob } = await supabase.storage.from('libraries').download(ezcPath);
        if (ezcBlob) ezcContent = await ezcBlob.text();

        const { data: ezlBlob } = await supabase.storage.from('libraries').download(ezlPath);
        if (ezlBlob) ezlContent = await ezlBlob.text();

        const { data: svgBlob } = await supabase.storage.from('libraries').download(svgPath);
        if (svgBlob) svgContent = await svgBlob.text();
    }

    if (ezcContent) {
        const def = loadComponent(ezcContent, ezlContent);
        if (def && svgContent) {
            def.svgPreview = svgContent;
        }
        return def;
    }
    return null;
};

export const toLiteSimDef = (ezcDef) => {
    return {
        ...ezcDef,
        ports: ezcDef.pins ? ezcDef.pins.map(p => ({
            id: p.name,
            x: parseFloat(p.x || 0),
            y: parseFloat(p.y || 0)
        })) : [],
        defaultSize: {
            width: parseFloat(ezcDef.width || 40),
            height: parseFloat(ezcDef.height || 40)
        }
    };
};
