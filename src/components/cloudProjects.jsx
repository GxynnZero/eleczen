// =============================================================
// CloudProjectsModal.jsx — Browse & manage cloud projects
// =============================================================
import { createSignal, createEffect, For, Show, onMount } from 'solid-js';
import {
  X, Cloud, Loader, Trash2, Download, Globe, Lock,
  Clock, Plus, Save, AlertCircle, FolderOpen, Copy
} from 'lucide-solid';
import {
  cloudProjectId, cloudProjectName, setCloudProjectName,
  cloudSyncing, cloudError, userProjects, projectsLoading,
  saveToCloud, loadFromCloud, loadUserProjects, deleteCloudProject,
} from '../utils/cloudStore.js';
import { fetchPublicProjects, forkProject } from '../lib/api/projects.js';
import { pushLog } from '../utils/simulation/index.js';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ProjectRow(props) {
  const [confirming, setConfirming] = createSignal(false);

  return (
    <div class="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05] px-4 py-3 transition-all">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium text-white text-sm truncate">{props.project.name}</span>
          {props.project.is_public
            ? <Globe size={11} class="shrink-0 text-emerald-400" />
            : <Lock size={11} class="shrink-0 text-zinc-600" />}
        </div>
        <div class="flex items-center gap-2 mt-0.5">
          <Clock size={10} class="text-zinc-600" />
          <span class="text-[11px] text-zinc-500">{timeAgo(props.project.updated_at)}</span>
          {props.project.id === cloudProjectId() && (
            <span class="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] text-cyan-400">
              current
            </span>
          )}
        </div>
      </div>

      <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => { props.onLoad(props.project); }}
          title="Open"
          class="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition"
        >
          <FolderOpen size={14} />
        </button>

        {props.onFork && (
          <button
            onClick={() => props.onFork(props.project)}
            title="Fork"
            class="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-emerald-400 transition"
          >
            <Copy size={14} />
          </button>
        )}

        {props.onDelete && (
          confirming()
            ? (
              <div class="flex items-center gap-1">
                <button onClick={() => props.onDelete(props.project.id)} class="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-[11px] text-red-400 hover:bg-red-500/30 transition">
                  Confirm
                </button>
                <button onClick={() => setConfirming(false)} class="px-2 py-1 rounded-lg text-[11px] text-zinc-500 hover:text-white transition">
                  Cancel
                </button>
              </div>
            )
            : (
              <button
                onClick={() => setConfirming(true)}
                title="Delete"
                class="p-1.5 rounded-xl hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition"
              >
                <Trash2 size={14} />
              </button>
            )
        )}
      </div>
    </div>
  );
}

export default function CloudProjectsModal(props) {
  const [tab,         setTab]         = createSignal('mine');     // 'mine' | 'community'
  const [saveName,    setSaveName]    = createSignal(cloudProjectName());
  const [isPublic,    setIsPublic]    = createSignal(false);
  const [community,   setCommunity]   = createSignal([]);
  const [commLoading, setCommLoading] = createSignal(false);
  const [search,      setSearch]      = createSignal('');

  onMount(() => {
    loadUserProjects();
  });

  createEffect(() => {
    if (tab() === 'community') loadCommunity();
  });

  const loadCommunity = async () => {
    setCommLoading(true);
    const { data } = await fetchPublicProjects({ search: search(), limit: 20 });
    setCommunity(data || []);
    setCommLoading(false);
  };

  const handleSave = async () => {
    await saveToCloud(saveName(), isPublic());
  };

  const handleFork = async (project) => {
    const { data, error } = await forkProject(project.id);
    if (error) { pushLog(`Fork failed: ${error.message}`, 'warn'); return; }
    loadFromCloud(data);
    pushLog(`☁️ Forked "${project.name}"`, 'success');
    props.onClose?.();
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={props.onClose} />

      <div class="relative z-10 flex flex-col w-full max-w-2xl h-[80vh] rounded-3xl border border-white/10 bg-[#07090f] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div class="flex items-center gap-3 px-6 py-4 border-b border-white/[0.07] bg-black/30">
          <Cloud size={20} class="text-cyan-400" />
          <div class="flex-1">
            <h2 class="text-white font-semibold text-base leading-none">Cloud Projects</h2>
            <p class="text-xs text-zinc-500 mt-0.5">Save, load, and share circuits</p>
          </div>
          <button onClick={props.onClose} class="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div class="flex border-b border-white/[0.07]">
          {[['mine', 'My Projects'], ['community', 'Community']].map(([val, label]) => (
            <button
              onClick={() => setTab(val)}
              class={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
                tab() === val
                  ? 'border-cyan-500 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* ── My Projects tab ── */}
          <Show when={tab() === 'mine'}>
            {/* Save section */}
            <div class="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col gap-3">
              <p class="text-xs text-zinc-400 font-medium uppercase tracking-wider">Save current circuit</p>
              <div class="flex gap-2">
                <input
                  type="text"
                  value={saveName()}
                  onInput={e => setSaveName(e.currentTarget.value)}
                  placeholder="Project name…"
                  class="flex-1 rounded-xl bg-black/40 border border-white/[0.08] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-cyan-500/40 transition"
                />
                <label class="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/20 border border-white/[0.08] cursor-pointer text-xs text-zinc-400 hover:border-white/20 transition">
                  <input
                    type="checkbox"
                    checked={isPublic()}
                    onChange={e => setIsPublic(e.currentTarget.checked)}
                    class="accent-cyan-500"
                  />
                  Public
                </label>
                <button
                  onClick={handleSave}
                  disabled={cloudSyncing() || !saveName().trim()}
                  class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-black shadow hover:opacity-90 active:scale-95 transition disabled:opacity-50"
                >
                  {cloudSyncing() ? <Loader size={14} class="animate-spin" /> : <Save size={14} />}
                  Save
                </button>
              </div>
              <Show when={cloudError()}>
                <div class="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle size={12} />
                  {cloudError()}
                </div>
              </Show>
            </div>

            {/* My project list */}
            <div class="flex flex-col gap-2">
              <p class="text-xs text-zinc-500 uppercase tracking-wider">Your projects ({userProjects().length})</p>
              <Show when={projectsLoading()}>
                <div class="flex justify-center py-8">
                  <Loader size={24} class="animate-spin text-cyan-500" />
                </div>
              </Show>
              <Show when={!projectsLoading() && userProjects().length === 0}>
                <div class="text-center py-10 text-zinc-600 text-sm">No saved projects yet</div>
              </Show>
              <For each={userProjects()}>
                {project => (
                  <ProjectRow
                    project={project}
                    onLoad={p => { loadFromCloud(p); props.onClose?.(); }}
                    onDelete={deleteCloudProject}
                  />
                )}
              </For>
            </div>
          </Show>

          {/* ── Community tab ── */}
          <Show when={tab() === 'community'}>
            <input
              type="text"
              value={search()}
              onInput={e => { setSearch(e.currentTarget.value); loadCommunity(); }}
              placeholder="Search community projects…"
              class="w-full rounded-xl bg-black/40 border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-cyan-500/40 transition"
            />
            <Show when={commLoading()}>
              <div class="flex justify-center py-8">
                <Loader size={24} class="animate-spin text-cyan-500" />
              </div>
            </Show>
            <div class="flex flex-col gap-2">
              <For each={community()}>
                {project => (
                  <ProjectRow
                    project={project}
                    onLoad={p => { loadFromCloud(p); props.onClose?.(); }}
                    onFork={handleFork}
                  />
                )}
              </For>
            </div>
            <Show when={!commLoading() && community().length === 0}>
              <div class="text-center py-10 text-zinc-600 text-sm">No public projects found</div>
            </Show>
          </Show>

        </div>
      </div>
    </div>
  );
}
