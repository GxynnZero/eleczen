// =============================================================
// CloudLibrary.jsx — Browse & import community components
// =============================================================
import { createSignal, createEffect, For, Show, onMount } from 'solid-js';
import {
  Search, X, CloudDownload, Star, Package, Upload,
  ChevronRight, Loader, AlertCircle, Tag, Globe, CheckCircle2
} from 'lucide-solid';
import { fetchCloudComponents, incrementDownloads } from '../lib/api/components';
import { addComponent, pushLog } from '../utils/simulation/index';

const TAG_OPTIONS = ['analog', 'digital', 'rf', 'power', 'sensor', 'opamp', 'mcu'];

// Map cloud component type to a local PARTS type for placement
const CLOUD_TO_LOCAL_TYPE = {
  resistor: 'resistor', capacitor: 'capacitor', inductor: 'inductor',
  led: 'led', diode: 'diode', zener: 'zener', battery: 'battery',
  switch: 'switch', npn: 'npn', pnp: 'pnp', mosfet_n: 'mosfet_n',
  voltmeter: 'voltmeter', ground: 'ground',
};

function ComponentCard(props) {
  const [busy, setBusy] = createSignal(false);

  const handleImport = async () => {
    setBusy(true);
    try {
      const localType = CLOUD_TO_LOCAL_TYPE[props.item.type] || 'resistor';
      addComponent(localType);
      await incrementDownloads(props.item.id);
      pushLog(`☁️ Imported "${props.item.name}"`, 'success');
      props.onClose?.();
    } catch (e) {
      pushLog(`Import failed: ${e.message}`, 'warn');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:border-cyan-500/30 hover:bg-white/[0.06] transition-all duration-200 overflow-hidden">
      {/* Symbol preview */}
      <div class="h-24 flex items-center justify-center bg-black/40 border-b border-white/5">
        {props.item.symbol_svg
          ? <div innerHTML={props.item.symbol_svg} class="w-20 h-16 text-cyan-400" />
          : <Package size={32} class="text-zinc-600" />}
      </div>

      <div class="p-3 flex flex-col gap-2 flex-1">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-semibold text-white text-sm leading-tight flex items-center gap-1.5">
              {props.item.name}
              <Show when={props.item.verified}>
                <CheckCircle2 size={12} class="text-blue-400 fill-blue-400/10" />
              </Show>
            </div>
            <div class="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider">{props.item.type}</div>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <div class="flex items-center gap-1 text-[10px] text-zinc-500">
              <CloudDownload size={10} />
              {props.item.downloads ?? 0}
            </div>
            <Show when={props.item.rating}>
              <div class="flex items-center gap-0.5 text-[10px] text-amber-400">
                <Star size={10} class="fill-current" />
                {props.item.rating.toFixed(1)}
              </div>
            </Show>
          </div>
        </div>

        <p class="text-xs text-zinc-400 line-clamp-2 flex-1">
          {props.item.description || 'No description'}
        </p>

        {/* Tags */}
        <div class="flex flex-wrap gap-1">
          {(props.item.tags || []).slice(0, 3).map(t => (
            <span class="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-500/20">
              {t}
            </span>
          ))}
        </div>

        <div class="flex items-center justify-between mt-1">
          <span class="text-[10px] text-zinc-600">
            by {props.item.profiles?.username || 'community'}
          </span>
          <button
            onClick={handleImport}
            disabled={busy()}
            class="flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 text-[11px] font-medium text-cyan-400 hover:bg-cyan-500/25 transition disabled:opacity-40"
          >
            {busy()
              ? <Loader size={10} class="animate-spin" />
              : <CloudDownload size={10} />}
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CloudLibrary(props) {
  const [query,   setQuery]   = createSignal('');
  const [tags,    setTags]    = createSignal([]);
  const [items,   setItems]   = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [error,   setError]   = createSignal(null);

  const toggleTag = (t) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await fetchCloudComponents({
      search: query(),
      tags:   tags(),
    });
    setLoading(false);
    if (e) { setError(e.message); return; }
    setItems(data || []);
  };

  onMount(load);

  // Debounced search
  let debounce;
  createEffect(() => {
    query(); tags(); // track
    clearTimeout(debounce);
    debounce = setTimeout(load, 320);
  });

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div class="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={props.onClose} />

      {/* Modal */}
      <div class="relative z-10 flex flex-col w-full max-w-5xl h-[85vh] rounded-3xl border border-white/10 bg-[#07090f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div class="flex items-center gap-4 px-6 py-4 border-b border-white/[0.07] bg-black/30">
          <Globe size={20} class="text-cyan-400" />
          <div>
            <h2 class="text-white font-semibold text-base leading-none">Cloud Component Library</h2>
            <p class="text-xs text-zinc-500 mt-0.5">Browse & import community-shared parts</p>
          </div>
          <button
            onClick={props.onClose}
            class="ml-auto p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters */}
        <div class="px-6 py-3 border-b border-white/[0.07] bg-black/20 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div class="relative flex-1 min-w-[200px]">
            <Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search components…"
              value={query()}
              onInput={e => setQuery(e.currentTarget.value)}
              class="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/40 transition"
            />
          </div>

          {/* Tag filters */}
          <div class="flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map(t => (
              <button
                onClick={() => toggleTag(t)}
                class={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium border transition ${
                  tags().includes(t)
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/20'
                }`}
              >
                <Tag size={9} />
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div class="flex-1 overflow-y-auto p-6">
          <Show when={loading()}>
            <div class="flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
              <Loader size={32} class="animate-spin text-cyan-500" />
              <span class="text-sm">Loading components…</span>
            </div>
          </Show>

          <Show when={error()}>
            <div class="flex flex-col items-center justify-center h-full gap-3 text-zinc-500">
              <AlertCircle size={32} class="text-red-400" />
              <p class="text-sm text-red-300">{error()}</p>
              <button onClick={load} class="text-xs text-cyan-400 hover:underline">Retry</button>
            </div>
          </Show>

          <Show when={!loading() && !error() && items().length === 0}>
            <div class="flex flex-col items-center justify-center h-full gap-3 text-zinc-500">
              <Package size={40} />
              <p class="text-sm">No components found</p>
              <p class="text-xs text-zinc-600">Try a different search or tag</p>
            </div>
          </Show>

          <Show when={!loading() && items().length > 0}>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <For each={items()}>
                {item => <ComponentCard item={item} onClose={props.onClose} />}
              </For>
            </div>
          </Show>
        </div>

        {/* Footer */}
        <div class="flex items-center justify-between px-6 py-3 border-t border-white/[0.07] bg-black/20">
          <p class="text-xs text-zinc-600">
            {items().length} components · Community library
          </p>
          <a
            href="https://docs.eleczen.app/cloud-library"
            target="_blank"
            class="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
          >
            Learn about publishing <ChevronRight size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
