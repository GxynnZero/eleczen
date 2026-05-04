import { createSignal, Show, For, onMount } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { 
    publishCloudComponent, 
    fetchCloudComponent, 
    updateCloudComponent, 
    deleteCloudComponent 
} from "../lib/api/components";
import { 
    Upload, 
    Box, 
    Code, 
    Type, 
    Tag as TagIcon, 
    FileText, 
    Plus, 
    X, 
    CheckCircle2,
    ArrowLeft,
    AlertCircle,
    Settings as SettingsIcon,
    Cpu,
    Trash2,
    Save,
    Link as LinkIcon,
    Image as ImageIcon,
    DollarSign,
    Hash,
    Building2,
    Barcode
} from "lucide-solid";
import { createEffect } from "solid-js";

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

export default function PublishPage() {
    const navigate = useNavigate();
    const params = useParams();
    const isEdit = () => !!params.id;
    
    // Core Schema state
    const [name, setName] = createSignal("");
    const [slug, setSlug] = createSignal("");
    const [manufacturer, setManufacturer] = createSignal("");
    const [partNumber, setPartNumber] = createSignal("");
    const [category, setCategory] = createSignal("passive");
    const [description, setDescription] = createSignal("");
    const [specifications, setSpecifications] = createSignal("{}");
    const [tags, setTags] = createSignal<string[]>([]);
    const [imageUrl, setImageUrl] = createSignal("");
    const [datasheetUrl, setDatasheetUrl] = createSignal("");
    const [pinoutImage, setPinoutImage] = createSignal("");
    const [pricing, setPricing] = createSignal("{}");
    
    // Simulation state
    const [symbolSvg, setSymbolSvg] = createSignal("");
    const [spiceModel, setSpiceModel] = createSignal("");
    const [verilogModel, setVerilogModel] = createSignal("");
    
    // UI state
    const [loading, setLoading] = createSignal(false);
    const [fetching, setFetching] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [success, setSuccess] = createSignal(false);
    const [activeTab, setActiveTab] = createSignal("spice");
    const [newTag, setNewTag] = createSignal("");
    const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);

    // Auto-generate slug from name
    createEffect(() => {
        if (!isEdit() && name()) {
            setSlug(slugify(name()));
        }
    });

    onMount(async () => {
        if (params.id) {
            setFetching(true);
            try {
                const { data, error: fetchErr } = await fetchCloudComponent(params.id);
                if (fetchErr) throw fetchErr;
                if (data) {
                    setName(data.name || "");
                    setSlug(data.slug || "");
                    setManufacturer(data.manufacturer || "");
                    setPartNumber(data.part_number || "");
                    setCategory(data.category || "passive");
                    setDescription(data.description || "");
                    setSpecifications(JSON.stringify(data.specifications || {}, null, 2));
                    setTags(data.tags || []);
                    setImageUrl(data.image_url || "");
                    setDatasheetUrl(data.datasheet_url || "");
                    setPinoutImage(data.pinout_image || "");
                    setPricing(JSON.stringify(data.pricing || {}, null, 2));
                    
                    setSymbolSvg(data.symbol_svg || "");
                    setSpiceModel(data.spice_model || "");
                    setVerilogModel(data.verilog_model || "");
                }
            } catch (err: any) {
                setError(err.message || "Failed to load component data");
            } finally {
                setFetching(false);
            }
        }
    });

    const handleAddTag = (e: Event) => {
        e.preventDefault();
        const tag = newTag().trim().toLowerCase();
        if (tag && !tags().includes(tag)) {
            setTags([...tags(), tag]);
            setNewTag("");
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags().filter(t => t !== tag));
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!name() || !category()) {
            setError("Name and Category are required.");
            setLoading(false);
            return;
        }

        let parsedSpecs = {};
        let parsedPricing = {};
        try {
            parsedSpecs = JSON.parse(specifications());
            parsedPricing = JSON.parse(pricing());
        } catch (e) {
            setError("Invalid JSON in Specifications or Pricing field.");
            setLoading(false);
            return;
        }

        try {
            const componentData = {
                name: name(),
                slug: slug() || undefined,
                manufacturer: manufacturer(),
                part_number: partNumber(),
                category: category(),
                description: description(),
                specifications: parsedSpecs,
                tags: tags(),
                image_url: imageUrl(),
                datasheet_url: datasheetUrl(),
                pinout_image: pinoutImage(),
                pricing: parsedPricing,
                symbol_svg: symbolSvg(),
                spice_model: spiceModel(),
                verilog_model: verilogModel()
            };

            const { data, error: publishErr } = isEdit() 
                ? await updateCloudComponent(params.id, componentData)
                : await publishCloudComponent(componentData);

            if (publishErr) throw publishErr;

            setSuccess(true);
            setTimeout(() => navigate("/editor"), 2000);
        } catch (err: any) {
            setError(err.message || "Failed to save component");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const { error: delErr } = await deleteCloudComponent(params.id);
            if (delErr) throw delErr;
            navigate("/editor");
        } catch (err: any) {
            setError(err.message || "Failed to delete component");
            setShowDeleteConfirm(false);
        } finally {
            setLoading(false);
        }
    };

    const TabButton = (props: { id: string, label: string, icon: any }) => (
        <button
            type="button"
            onClick={() => setActiveTab(props.id)}
            class={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab() === props.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
        >
            <props.icon size={16} />
            {props.label}
        </button>
    );

    return (
        <div class="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header class="border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button 
                        onClick={() => navigate("/editor")}
                        class="flex items-center gap-2 text-sm font-medium hover:text-white transition group"
                    >
                        <ArrowLeft size={18} class="group-hover:-translate-x-1 transition-transform" />
                        Back to Editor
                    </button>
                    
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            {isEdit() ? <Save size={20} /> : <Upload size={20} />}
                        </div>
                        <h1 class="text-xl font-bold text-white tracking-tight">
                            {isEdit() ? "Edit Component Metadata" : "Add New Component"}
                        </h1>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <Show when={isEdit()}>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                class="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition px-4 py-2 rounded-xl hover:bg-red-500/10"
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>
                        </Show>
                        <div class="w-px h-6 bg-white/10 mx-2" />
                        <button 
                            type="button"
                            onClick={handleSubmit}
                            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Save size={18} />
                            {isEdit() ? "Update" : "Publish"}
                        </button>
                    </div>
                </div>
            </header>

            <main class="max-w-7xl mx-auto px-6 py-12">
                <Show when={fetching()}>
                    <div class="flex flex-col items-center justify-center py-40 gap-4">
                        <div class="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <p class="text-zinc-500 font-medium">Loading component details...</p>
                    </div>
                </Show>

                <Show when={!fetching() && success()}>
                    <div class="max-w-2xl mx-auto text-center py-20 animate-in fade-in zoom-in duration-500">
                        <div class="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 class="text-3xl font-bold text-white mb-4">Metadata Updated!</h2>
                        <p class="text-zinc-400 leading-relaxed">
                            Successfully saved catalog changes.
                        </p>
                    </div>
                </Show>

                <Show when={!fetching() && !success()}>
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Main Content Area */}
                        <div class="lg:col-span-8 space-y-8">
                            
                            {/* Identity & Manufacturing Section */}
                            <section class="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-6">
                                <div class="flex items-center gap-3">
                                    <Type size={20} class="text-blue-400" />
                                    <h3 class="text-lg font-semibold text-white">Identity & Manufacturing</h3>
                                </div>

                                <div class="grid grid-cols-2 gap-6">
                                    <div class="col-span-2">
                                        <label class="block text-sm font-medium text-zinc-400 mb-2">Display Name *</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. SN74HC04 Hex Inverter"
                                            value={name()}
                                            onInput={e => setName(e.currentTarget.value)}
                                            class="w-full bg-zinc-800/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition"
                                        />
                                    </div>
                                    <div class="col-span-2 sm:col-span-1">
                                        <label class="block text-sm font-medium text-zinc-400 mb-2">Manufacturer</label>
                                        <div class="relative">
                                            <Building2 size={16} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Texas Instruments"
                                                value={manufacturer()}
                                                onInput={e => setManufacturer(e.currentTarget.value)}
                                                class="w-full bg-zinc-800/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-zinc-300 focus:outline-none focus:border-blue-500/50 transition"
                                            />
                                        </div>
                                    </div>
                                    <div class="col-span-2 sm:col-span-1">
                                        <label class="block text-sm font-medium text-zinc-400 mb-2">MPN / Part Number</label>
                                        <div class="relative">
                                            <Barcode size={16} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input 
                                                type="text" 
                                                placeholder="e.g. SN74HC04N"
                                                value={partNumber()}
                                                onInput={e => setPartNumber(e.currentTarget.value)}
                                                class="w-full bg-zinc-800/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-zinc-300 font-mono text-sm focus:outline-none focus:border-blue-500/50 transition"
                                            />
                                        </div>
                                    </div>
                                    <div class="col-span-2 sm:col-span-1">
                                        <label class="block text-sm font-medium text-zinc-400 mb-2">Slug (Unique URL)</label>
                                        <div class="relative">
                                            <Hash size={16} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input 
                                                type="text" 
                                                placeholder="sn74hc04-hex-inverter"
                                                value={slug()}
                                                readOnly
                                                class="w-full bg-zinc-950/30 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-zinc-500 font-mono text-[10px] cursor-not-allowed transition"
                                            />
                                        </div>
                                    </div>
                                    <div class="col-span-2 sm:col-span-1">
                                        <label class="block text-sm font-medium text-zinc-400 mb-2">Category *</label>
                                        <select 
                                            value={category()}
                                            onChange={e => setCategory(e.currentTarget.value)}
                                            class="w-full bg-zinc-800/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition appearance-none"
                                        >
                                            <option value="ic">Integrated Circuit</option>
                                            <option value="discrete">Discrete Semiconductor</option>
                                            <option value="passive">Passive Component</option>
                                            <option value="power">Power Management</option>
                                            <option value="sensor">Sensor / Module</option>
                                            <option value="digital">Digital Logic</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-zinc-400 mb-2">Product Description</label>
                                    <textarea 
                                        placeholder="Detailed explanation of the component..."
                                        value={description()}
                                        onInput={e => setDescription(e.currentTarget.value)}
                                        rows={3}
                                        class="w-full bg-zinc-800/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition resize-none"
                                    />
                                </div>
                            </section>

                            {/* Models & Data Section */}
                            <section class="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-6">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <Code size={20} class="text-purple-400" />
                                        <h3 class="text-lg font-semibold text-white">Engineering Data</h3>
                                    </div>
                                    <div class="flex bg-zinc-950/50 p-1 rounded-2xl border border-white/5">
                                        <TabButton id="spice" label="SPICE" icon={Code} />
                                        <TabButton id="verilog" label="Verilog" icon={Cpu} />
                                        <TabButton id="specs" label="Specs" icon={SettingsIcon} />
                                        <TabButton id="pricing" label="Pricing" icon={DollarSign} />
                                    </div>
                                </div>

                                <div class="space-y-4">
                                    <Show when={activeTab() === 'spice'}>
                                        <textarea 
                                            placeholder="SPICE Model Definition..."
                                            value={spiceModel()}
                                            onInput={e => setSpiceModel(e.currentTarget.value)}
                                            rows={10}
                                            class="w-full bg-zinc-950/50 border border-white/10 rounded-2xl px-4 py-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-purple-500/50 transition resize-none"
                                        />
                                    </Show>
                                    <Show when={activeTab() === 'verilog'}>
                                        <textarea 
                                            placeholder="Verilog-A or HDL Model..."
                                            value={verilogModel()}
                                            onInput={e => setVerilogModel(e.currentTarget.value)}
                                            rows={10}
                                            class="w-full bg-zinc-950/50 border border-white/10 rounded-2xl px-4 py-3 text-blue-400 font-mono text-sm focus:outline-none focus:border-blue-500/50 transition resize-none"
                                        />
                                    </Show>
                                    <Show when={activeTab() === 'specs'}>
                                        <textarea 
                                            placeholder='{ "voltage_max": "15V", "temp_range": "-40C to 85C" }'
                                            value={specifications()}
                                            onInput={e => setSpecifications(e.currentTarget.value)}
                                            rows={10}
                                            class="w-full bg-zinc-950/50 border border-white/10 rounded-2xl px-4 py-3 text-amber-400 font-mono text-sm focus:outline-none focus:border-amber-500/50 transition resize-none"
                                        />
                                    </Show>
                                    <Show when={activeTab() === 'pricing'}>
                                        <textarea 
                                            placeholder='{ "unit_price": 0.45, "bulk_100": 0.38 }'
                                            value={pricing()}
                                            onInput={e => setPricing(e.currentTarget.value)}
                                            rows={10}
                                            class="w-full bg-zinc-950/50 border border-white/10 rounded-2xl px-4 py-3 text-rose-400 font-mono text-sm focus:outline-none focus:border-rose-500/50 transition resize-none"
                                        />
                                    </Show>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div class="lg:col-span-4 space-y-8">
                            
                            {/* Media & Resources */}
                            <section class="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-6 shadow-2xl">
                                <div class="flex items-center gap-3">
                                    <ImageIcon size={18} class="text-zinc-400" />
                                    <h3 class="text-sm font-bold text-white uppercase tracking-widest">Media & Docs</h3>
                                </div>

                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Main Product Image URL</label>
                                        <input 
                                            type="url" 
                                            placeholder="https://image-hosting.com/part.jpg"
                                            value={imageUrl()}
                                            onInput={e => setImageUrl(e.currentTarget.value)}
                                            class="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/50 transition"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Datasheet URL</label>
                                        <div class="relative">
                                            <LinkIcon size={14} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input 
                                                type="url" 
                                                placeholder="https://datasheet.com/part.pdf"
                                                value={datasheetUrl()}
                                                onInput={e => setDatasheetUrl(e.currentTarget.value)}
                                                class="w-full bg-zinc-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-blue-400 focus:outline-none focus:border-blue-500/50 transition"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">SVG Symbol XML</label>
                                        <textarea 
                                            placeholder="<svg>...</svg>"
                                            value={symbolSvg()}
                                            onInput={e => setSymbolSvg(e.currentTarget.value)}
                                            rows={4}
                                            class="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-400 font-mono focus:outline-none focus:border-blue-500/50 transition resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Catalog Preview */}
                            <div class="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                <div class="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <h3 class="text-xs font-bold text-white uppercase tracking-widest">Catalog Card</h3>
                                    <div class="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">LIVE</div>
                                </div>
                                <div class="p-5">
                                    <div class="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden group">
                                        <div class="h-32 flex items-center justify-center bg-black/40 border-b border-white/5 relative">
                                            <Show when={imageUrl()} fallback={
                                                <Show when={symbolSvg()} fallback={<Box size={32} class="text-zinc-700" />}>
                                                    <div innerHTML={symbolSvg()} class="w-full h-full flex items-center justify-center p-6 text-blue-400 [&>svg]:w-full [&>svg]:h-full" />
                                                </Show>
                                            }>
                                                <img src={imageUrl()} class="w-full h-full object-contain p-2" />
                                            </Show>
                                            <div class="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] text-zinc-400 font-mono">
                                                {partNumber() || "PN-XXXX"}
                                            </div>
                                        </div>
                                        <div class="p-3 space-y-2">
                                            <div class="text-[9px] text-zinc-500 uppercase font-bold">{manufacturer() || "MANUFACTURER"}</div>
                                            <div class="font-bold text-white text-xs line-clamp-1">{name() || "New Component"}</div>
                                            <p class="text-[10px] text-zinc-400 line-clamp-2 h-6 leading-relaxed">
                                                {description() || "Describe the component..."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tags Section */}
                            <section class="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
                                <div class="flex items-center gap-3">
                                    <TagIcon size={18} class="text-zinc-400" />
                                    <h3 class="text-xs font-bold text-white uppercase tracking-widest">Metadata Tags</h3>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <For each={tags()}>
                                        {(tag) => (
                                            <span class="flex items-center gap-1 px-2 py-1 bg-zinc-800 border border-white/5 rounded-lg text-[10px] text-zinc-300">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} class="hover:text-red-400 transition"><X size={10} /></button>
                                            </span>
                                        )}
                                    </For>
                                </div>
                                <div class="relative pt-2">
                                    <input 
                                        type="text"
                                        placeholder="Add tag..."
                                        value={newTag()}
                                        onInput={e => setNewTag(e.currentTarget.value)}
                                        onKeyDown={e => e.key === "Enter" && handleAddTag(e)}
                                        class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition"
                                    />
                                    <button onClick={handleAddTag} class="absolute right-2 top-4 text-blue-400 hover:text-blue-300"><Plus size={14} /></button>
                                </div>
                            </section>

                        </div>
                    </div>
                </Show>

                {/* Delete Confirmation Modal */}
                <Show when={showDeleteConfirm()}>
                    <div class="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
                        <div class="relative bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <div class="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mb-6 text-red-400">
                                <Trash2 size={32} />
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-2">Delete Catalog Entry?</h3>
                            <p class="text-zinc-400 mb-8">This will permanently remove this part from the official manufacturing catalog.</p>
                            <div class="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} class="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-semibold transition">Cancel</button>
                                <button onClick={handleDelete} class="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-semibold transition shadow-lg shadow-red-500/20">Delete Part</button>
                            </div>
                        </div>
                    </div>
                </Show>
            </main>

            {/* Background Decoration */}
            <div class="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div class="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        </div>
    );
}
