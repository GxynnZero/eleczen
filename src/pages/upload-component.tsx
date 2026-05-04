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
    const [ports, setPorts] = createSignal<any[]>([]);
    
    // New Advanced Metadata
    const [packageType, setPackageType] = createSignal("");
    const [footprint, setFootprint] = createSignal("");
    const [voltageMin, setVoltageMin] = createSignal("");
    const [voltageMax, setVoltageMax] = createSignal("");
    const [tempMin, setTempMin] = createSignal("");
    const [tempMax, setTempMax] = createSignal("");
    const [powerRating, setPowerRating] = createSignal("");
    
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
    const [currentStep, setCurrentStep] = createSignal(1);
    const totalSteps = 5;

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
                    setPorts(data.specifications?.ports || []);
                    
                    setSymbolSvg(data.symbol_svg || "");
                    setSpiceModel(data.spice_model || "");
                    setVerilogModel(data.verilog_model || "");

                    // Advanced Load
                    const specs = data.specifications || {};
                    setPackageType(specs.package_type || "");
                    setFootprint(specs.footprint || "");
                    setVoltageMin(specs.voltage_min || "");
                    setVoltageMax(specs.voltage_max || "");
                    setTempMin(specs.temp_min || "");
                    setTempMax(specs.temp_max || "");
                    setPowerRating(specs.power_rating || "");
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
            
            // Inject ports into specifications
            parsedSpecs = { ...parsedSpecs, ports: ports() };
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
                specifications: {
                    ...parsedSpecs,
                    package_type: packageType(),
                    footprint: footprint(),
                    voltage_min: voltageMin(),
                    voltage_max: voltageMax(),
                    temp_min: tempMin(),
                    temp_max: tempMax(),
                    power_rating: powerRating(),
                    ports: ports()
                },
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

    const addPort = () => {
        setPorts([...ports(), { id: `p${ports().length + 1}`, label: `P${ports().length + 1}`, x: 0, y: 0 }]);
    };

    const removePort = (index: number) => {
        setPorts(ports().filter((_, i) => i !== index));
    };

    const updatePort = (index: number, field: string, value: any) => {
        setPorts(ports().map((p, i) => i === index ? { ...p, [field]: value } : p));
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
                <div class="max-w-7xl mx-auto px-6 h-20 grid grid-cols-3 items-center">
                    
                    {/* LEFT: BACK BUTTON */}
                    <div class="flex items-center">
                        <button 
                            onClick={() => navigate("/editor")}
                            class="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition group"
                        >
                            <ArrowLeft size={18} class="group-hover:-translate-x-1 transition-transform" />
                            <span class="hidden sm:inline">Back to Editor</span>
                        </button>
                    </div>

                    {/* CENTER: TITLE & PROGRESS */}
                    <div class="flex flex-col items-center gap-1.5">
                        <h1 class="text-sm font-bold text-white tracking-wide uppercase">
                            {isEdit() ? "Edit Component" : "Publish Part"}
                        </h1>
                        <div class="flex items-center gap-1.5">
                            <For each={Array.from({ length: totalSteps })}>
                                {(_, i) => (
                                    <div 
                                        class={`h-1 rounded-full transition-all duration-500 ${
                                            currentStep() > i() 
                                            ? "w-6 bg-blue-500" 
                                            : currentStep() === i() + 1 
                                            ? "w-8 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]" 
                                            : "w-3 bg-zinc-800"
                                        }`} 
                                    />
                                )}
                            </For>
                        </div>
                    </div>
                    
                    {/* RIGHT: ACTIONS */}
                    <div class="flex items-center justify-end gap-3">
                        <Show when={isEdit()}>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                class="text-zinc-500 hover:text-red-400 transition p-2 rounded-xl hover:bg-red-500/10"
                                title="Delete Component"
                            >
                                <Trash2 size={18} />
                            </button>
                        </Show>
                        
                        <div class="w-px h-6 bg-white/10 mx-2" />

                        <div class="flex items-center gap-2">
                            <Show when={currentStep() > 1}>
                                <button 
                                    onClick={() => setCurrentStep(currentStep() - 1)}
                                    class="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition bg-zinc-800/50 hover:bg-zinc-800 rounded-xl"
                                >
                                    Prev
                                </button>
                            </Show>
                            
                            <Show when={currentStep() < totalSteps}>
                                <button 
                                    onClick={() => setCurrentStep(currentStep() + 1)}
                                    class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                >
                                    Next
                                    <ArrowLeft size={14} class="rotate-180" />
                                </button>
                            </Show>

                            <Show when={currentStep() === totalSteps}>
                                <button 
                                    type="button"
                                    onClick={handleSubmit}
                                    class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 animate-in fade-in zoom-in duration-300"
                                >
                                    <Save size={16} />
                                    {isEdit() ? "Update" : "Publish"}
                                </button>
                            </Show>
                        </div>
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
                        <div class="lg:col-span-8">
                            <div class="min-h-[600px]">
                                <Show when={currentStep() === 1}>
                                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <section class="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <Type size={20} />
                                                </div>
                                                <div>
                                                    <h3 class="text-lg font-bold text-white">Identity</h3>
                                                    <p class="text-xs text-zinc-500">Core manufacturing identification</p>
                                                </div>
                                            </div>

                                            <div class="grid grid-cols-2 gap-6">
                                                <div class="col-span-2">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Display Name *</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. SN74HC04 Hex Inverter"
                                                        value={name()}
                                                        onInput={e => setName(e.currentTarget.value)}
                                                        class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition placeholder:text-zinc-600 shadow-inner"
                                                    />
                                                </div>
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Manufacturer</label>
                                                    <div class="relative">
                                                        <Building2 size={16} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. Texas Instruments"
                                                            value={manufacturer()}
                                                            onInput={e => setManufacturer(e.currentTarget.value)}
                                                            class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-zinc-300 focus:outline-none focus:border-blue-500/50 transition shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Part Number (MPN)</label>
                                                    <div class="relative">
                                                        <Barcode size={16} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. SN74HC04N"
                                                            value={partNumber()}
                                                            onInput={e => setPartNumber(e.currentTarget.value)}
                                                            class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-zinc-300 font-mono focus:outline-none focus:border-blue-500/50 transition shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Category *</label>
                                                    <select 
                                                        value={category()}
                                                        onChange={e => setCategory(e.currentTarget.value)}
                                                        class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition appearance-none shadow-inner"
                                                    >
                                                        <option value="ic">Integrated Circuit</option>
                                                        <option value="discrete">Discrete Semiconductor</option>
                                                        <option value="passive">Passive Component</option>
                                                        <option value="power">Power Management</option>
                                                        <option value="sensor">Sensor / Module</option>
                                                        <option value="digital">Digital Logic</option>
                                                    </select>
                                                </div>
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Unique Slug</label>
                                                    <div class="relative">
                                                        <Hash size={14} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                                        <input 
                                                            type="text" 
                                                            value={slug()}
                                                            readOnly
                                                            class="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-zinc-500 font-mono text-[10px] cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </Show>

                                <Show when={currentStep() === 2}>
                                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <section class="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h3 class="text-lg font-bold text-white">Documentation</h3>
                                                    <p class="text-xs text-zinc-500">External resources and descriptions</p>
                                                </div>
                                            </div>

                                            <div class="space-y-6">
                                                <div>
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Short Description</label>
                                                    <textarea 
                                                        placeholder="Brief summary of what this component does..."
                                                        value={description()}
                                                        onInput={e => setDescription(e.currentTarget.value)}
                                                        rows={4}
                                                        class="w-full bg-zinc-800/30 border border-white/10 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition resize-none shadow-inner"
                                                    />
                                                </div>
                                                <div class="grid grid-cols-2 gap-6">
                                                    <div class="col-span-2 sm:col-span-1">
                                                        <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Datasheet URL (PDF)</label>
                                                        <div class="relative">
                                                            <LinkIcon size={14} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                                            <input 
                                                                type="url" 
                                                                placeholder="https://example.com/spec.pdf"
                                                                value={datasheetUrl()}
                                                                onInput={e => setDatasheetUrl(e.currentTarget.value)}
                                                                class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-blue-400 focus:outline-none focus:border-purple-500/50 transition shadow-inner"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div class="col-span-2 sm:col-span-1">
                                                        <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Pinout Reference Image</label>
                                                        <div class="relative">
                                                            <ImageIcon size={14} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                                            <input 
                                                                type="url" 
                                                                placeholder="https://example.com/pinout.png"
                                                                value={pinoutImage()}
                                                                onInput={e => setPinoutImage(e.currentTarget.value)}
                                                                class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-zinc-400 focus:outline-none focus:border-purple-500/50 transition shadow-inner"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </Show>

                                <Show when={currentStep() === 3}>
                                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <section class="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                    <Box size={20} />
                                                </div>
                                                <div>
                                                    <h3 class="text-lg font-bold text-white">Physical Attributes</h3>
                                                    <p class="text-xs text-zinc-500">Packaging and footprint details</p>
                                                </div>
                                            </div>

                                            <div class="grid grid-cols-2 gap-6">
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Package Type</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. SOT-23-3, DIP-8, TO-220"
                                                        value={packageType()}
                                                        onInput={e => setPackageType(e.currentTarget.value)}
                                                        class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition shadow-inner"
                                                    />
                                                </div>
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">PCB Footprint Name</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. Footprint_Lib:SOT-23"
                                                        value={footprint()}
                                                        onInput={e => setFootprint(e.currentTarget.value)}
                                                        class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-5 py-4 text-zinc-400 focus:outline-none focus:border-emerald-500/50 transition shadow-inner font-mono text-sm"
                                                    />
                                                </div>
                                                <div class="col-span-2">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Product Photo URL</label>
                                                    <div class="relative">
                                                        <ImageIcon size={14} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                                        <input 
                                                            type="url" 
                                                            placeholder="https://example.com/product.jpg"
                                                            value={imageUrl()}
                                                            onInput={e => setImageUrl(e.currentTarget.value)}
                                                            class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </Show>

                                <Show when={currentStep() === 4}>
                                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <section class="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                                    <SettingsIcon size={20} />
                                                </div>
                                                <div>
                                                    <h3 class="text-lg font-bold text-white">Technical Specifications</h3>
                                                    <p class="text-xs text-zinc-500">Operating limits and electrical characteristics</p>
                                                </div>
                                            </div>

                                            <div class="grid grid-cols-2 gap-6">
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Voltage Range (Min / Max)</label>
                                                    <div class="flex items-center gap-2">
                                                        <input 
                                                            placeholder="Min V"
                                                            value={voltageMin()}
                                                            onInput={e => setVoltageMin(e.currentTarget.value)}
                                                            class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition shadow-inner"
                                                        />
                                                        <span class="text-zinc-600 font-bold">-</span>
                                                        <input 
                                                            placeholder="Max V"
                                                            value={voltageMax()}
                                                            onInput={e => setVoltageMax(e.currentTarget.value)}
                                                            class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Temp Range (°C Min / Max)</label>
                                                    <div class="flex items-center gap-2">
                                                        <input 
                                                            placeholder="Min °C"
                                                            value={tempMin()}
                                                            onInput={e => setTempMin(e.currentTarget.value)}
                                                            class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition shadow-inner"
                                                        />
                                                        <span class="text-zinc-600 font-bold">-</span>
                                                        <input 
                                                            placeholder="Max °C"
                                                            value={tempMax()}
                                                            onInput={e => setTempMax(e.currentTarget.value)}
                                                            class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Power Rating (Watts/mW)</label>
                                                    <input 
                                                        placeholder="e.g. 500mW"
                                                        value={powerRating()}
                                                        onInput={e => setPowerRating(e.currentTarget.value)}
                                                        class="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition shadow-inner"
                                                    />
                                                </div>
                                                <div class="col-span-2">
                                                    <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">Additional Specs (JSON)</label>
                                                    <textarea 
                                                        placeholder='{ "prop": "value" }'
                                                        value={specifications()}
                                                        onInput={e => setSpecifications(e.currentTarget.value)}
                                                        rows={4}
                                                        class="w-full bg-zinc-800/30 border border-white/10 rounded-3xl px-5 py-4 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500/50 transition resize-none shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </Show>

                                <Show when={currentStep() === 5}>
                                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <section class="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                        <Code size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 class="text-lg font-bold text-white">Engineering Lab</h3>
                                                        <p class="text-xs text-zinc-500">Simulations, symbols, and connections</p>
                                                    </div>
                                                </div>
                                                <div class="flex bg-zinc-950/50 p-1 rounded-2xl border border-white/5">
                                                    <TabButton id="spice" label="SPICE" icon={Code} />
                                                    <TabButton id="verilog" label="Verilog" icon={Cpu} />
                                                    <TabButton id="ports" label="Pins" icon={Hash} />
                                                </div>
                                            </div>

                                            <div class="min-h-[300px]">
                                                <Show when={activeTab() === 'spice'}>
                                                    <textarea 
                                                        placeholder="SPICE netlist definition..."
                                                        value={spiceModel()}
                                                        onInput={e => setSpiceModel(e.currentTarget.value)}
                                                        rows={12}
                                                        class="w-full bg-zinc-950/70 border border-white/10 rounded-3xl px-5 py-4 text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500/50 transition resize-none shadow-2xl"
                                                    />
                                                </Show>
                                                <Show when={activeTab() === 'verilog'}>
                                                    <textarea 
                                                        placeholder="Verilog-A model..."
                                                        value={verilogModel()}
                                                        onInput={e => setVerilogModel(e.currentTarget.value)}
                                                        rows={12}
                                                        class="w-full bg-zinc-950/70 border border-white/10 rounded-3xl px-5 py-4 text-blue-400 font-mono text-xs focus:outline-none focus:border-blue-500/50 transition resize-none shadow-2xl"
                                                    />
                                                </Show>
                                                <Show when={activeTab() === 'ports'}>
                                                    <div class="space-y-4">
                                                        <div class="flex items-center justify-between">
                                                            <p class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pins & Port Mapping</p>
                                                            <button 
                                                                type="button" 
                                                                onClick={addPort}
                                                                class="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-[10px] font-bold text-blue-400 hover:bg-blue-600/30 transition shadow-lg shadow-blue-500/10"
                                                            >
                                                                Add New Pin
                                                            </button>
                                                        </div>
                                                        <div class="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                                            <For each={ports()}>
                                                                {(port, i) => (
                                                                    <div class="grid grid-cols-12 gap-4 p-4 bg-zinc-950/40 border border-white/5 rounded-2xl items-center hover:border-white/10 transition group">
                                                                        <div class="col-span-3">
                                                                            <input 
                                                                                placeholder="ID"
                                                                                value={port.id}
                                                                                onInput={e => updatePort(i(), 'id', e.currentTarget.value)}
                                                                                class="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                                                                            />
                                                                        </div>
                                                                        <div class="col-span-3">
                                                                            <input 
                                                                                placeholder="Label"
                                                                                value={port.label}
                                                                                onInput={e => updatePort(i(), 'label', e.currentTarget.value)}
                                                                                class="w-full bg-transparent text-zinc-400 text-xs focus:outline-none"
                                                                            />
                                                                        </div>
                                                                        <div class="col-span-2">
                                                                            <input 
                                                                                type="number"
                                                                                value={port.x}
                                                                                onInput={e => updatePort(i(), 'x', Number(e.currentTarget.value))}
                                                                                class="w-full bg-transparent text-zinc-500 text-xs text-center focus:outline-none"
                                                                            />
                                                                        </div>
                                                                        <div class="col-span-2">
                                                                            <input 
                                                                                type="number"
                                                                                value={port.y}
                                                                                onInput={e => updatePort(i(), 'y', Number(e.currentTarget.value))}
                                                                                class="w-full bg-transparent text-zinc-500 text-xs text-center focus:outline-none"
                                                                            />
                                                                        </div>
                                                                        <div class="col-span-2 flex justify-end">
                                                                            <button onClick={() => removePort(i())} class="p-2 text-zinc-700 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                                                                                <X size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </For>
                                                        </div>
                                                    </div>
                                                </Show>
                                            </div>

                                            <div>
                                                <label class="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1">SVG Symbol XML</label>
                                                <textarea 
                                                    placeholder="<svg>...</svg>"
                                                    value={symbolSvg()}
                                                    onInput={e => setSymbolSvg(e.currentTarget.value)}
                                                    rows={4}
                                                    class="w-full bg-zinc-950/70 border border-white/10 rounded-2xl px-5 py-4 text-zinc-400 font-mono text-[10px] focus:outline-none focus:border-blue-500/50 transition resize-none shadow-2xl"
                                                />
                                            </div>
                                        </section>
                                    </div>
                                </Show>
                            </div>
                        </div>

                        {/* Sidebar: Sticky Preview */}
                        <div class="lg:col-span-4">
                            <div class="sticky top-32 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                                
                                {/* Catalog Preview */}
                                <div class="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                    <div class="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <h3 class="text-xs font-bold text-white uppercase tracking-widest">Live Catalog Card</h3>
                                        <div class="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">PREVIEW</div>
                                    </div>
                                    <div class="p-5">
                                        <div class="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden group">
                                            <div class="h-40 flex items-center justify-center bg-black/40 border-b border-white/5 relative">
                                                <Show when={imageUrl()} fallback={
                                                    <Show when={symbolSvg()} fallback={<Box size={40} class="text-zinc-800" />}>
                                                        <div innerHTML={symbolSvg()} class="w-full h-full flex items-center justify-center p-8 text-blue-400 [&>svg]:w-full [&>svg]:h-full" />
                                                    </Show>
                                                }>
                                                    <img src={imageUrl()} class="w-full h-full object-contain p-4" />
                                                </Show>
                                                <div class="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-zinc-400 font-mono">
                                                    {partNumber() || "PN-XXXX"}
                                                </div>
                                            </div>
                                            <div class="p-4 space-y-2">
                                                <div class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{manufacturer() || "MANUFACTURER"}</div>
                                                <div class="font-bold text-white text-sm line-clamp-1">{name() || "New Component"}</div>
                                                <p class="text-xs text-zinc-400 line-clamp-2 h-8 leading-relaxed">
                                                    {description() || "Describe the component..."}
                                                </p>
                                                
                                                <div class="pt-2 flex flex-wrap gap-1.5">
                                                    <Show when={category()}>
                                                        <span class="px-2 py-0.5 bg-zinc-800 rounded-md text-[9px] text-zinc-400 border border-white/5 uppercase font-medium">
                                                            {category()}
                                                        </span>
                                                    </Show>
                                                    <Show when={packageType()}>
                                                        <span class="px-2 py-0.5 bg-blue-500/10 rounded-md text-[9px] text-blue-400 border border-blue-500/10 uppercase font-medium">
                                                            {packageType()}
                                                        </span>
                                                    </Show>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags Summary */}
                                <section class="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
                                    <div class="flex items-center gap-3">
                                        <TagIcon size={18} class="text-zinc-500" />
                                        <h3 class="text-xs font-bold text-white uppercase tracking-widest">Labels & Tags</h3>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <For each={tags()} fallback={<p class="text-[10px] text-zinc-600 italic">No tags added yet</p>}>
                                            {(tag) => (
                                                <span class="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/50 border border-white/5 rounded-lg text-[10px] text-zinc-300">
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} class="hover:text-red-400 transition opacity-50 hover:opacity-100"><X size={10} /></button>
                                                </span>
                                            )}
                                        </For>
                                    </div>
                                    <div class="relative pt-2">
                                        <input 
                                            type="text"
                                            placeholder="Press enter to add..."
                                            value={newTag()}
                                            onInput={e => setNewTag(e.currentTarget.value)}
                                            onKeyDown={e => e.key === "Enter" && handleAddTag(e)}
                                            class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition placeholder:text-zinc-700"
                                        />
                                        <button onClick={handleAddTag} class="absolute right-3 top-4.5 text-blue-400 hover:text-blue-300 transition-colors"><Plus size={14} /></button>
                                    </div>
                                </section>

                                {/* Validation Note */}
                                <div class="px-6 py-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                    <div class="flex items-center gap-2 text-amber-400 mb-1">
                                        <AlertCircle size={14} />
                                        <span class="text-[10px] font-bold uppercase tracking-wider">Validation</span>
                                    </div>
                                    <p class="text-[10px] text-zinc-500 leading-relaxed">
                                        All entries are reviewed by the community. Ensure MPN and Manufacturer match official datasheets for verification.
                                    </p>
                                </div>

                            </div>
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
