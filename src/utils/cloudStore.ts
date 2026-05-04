// =============================================================
// src/utils/cloudStore.js — Reactive cloud state
//
// Manages: current project metadata, cloud sync status,
//          user's project list, save-to-cloud action
// =============================================================
import { createSignal } from 'solid-js';
import { saveProject as apiSave, fetchProjects as apiFetch, deleteProject as apiDelete } from '../lib/api/projects';
import { serializeProject, loadProject, pushLog } from './simulation/index';

// ─── Project metadata signals ─────────────────────────────────
const [cloudProjectId,   setCloudProjectId]   = createSignal(null);
const [cloudProjectName, setCloudProjectName] = createSignal('Untitled');
const [cloudSyncing,     setCloudSyncing]     = createSignal(false);
const [cloudError,       setCloudError]       = createSignal(null);
const [userProjects,     setUserProjects]      = createSignal([]);
const [projectsLoading,  setProjectsLoading]   = createSignal(false);

export {
  cloudProjectId,
  cloudProjectName,
  setCloudProjectName,
  cloudSyncing,
  cloudError,
  userProjects,
  projectsLoading,
};

// ─── Actions ─────────────────────────────────────────────────

/** Save the current circuit to Supabase. */
export async function saveToCloud(name, isPublic = false) {
  setCloudSyncing(true);
  setCloudError(null);

  try {
    // serializeProject() returns a JSON string; parse to object for Supabase jsonb column
    const circuit = JSON.parse(serializeProject());
    const { data, error } = await apiSave({
      id:        cloudProjectId() || undefined,
      name:      name || cloudProjectName(),
      circuit,
      is_public: isPublic,
    });

    if (error) throw error;

    setCloudProjectId(data.id);
    setCloudProjectName(data.name);
    pushLog(`☁️ Saved to cloud: "${data.name}"`, 'success');

    await loadUserProjects();
    return data;
  } catch (err) {
    setCloudError(err.message || 'Cloud save failed');
    pushLog(`☁️ Save failed: ${err.message}`, 'warn');
    return null;
  } finally {
    setCloudSyncing(false);
  }
}

/** Load a cloud project into the editor.
 *  project.circuit is a jsonb object from Supabase (already parsed). */
export function loadFromCloud(project) {
  try {
    // loadProject accepts a plain object or JSON string
    loadProject(project.circuit ?? project);
    setCloudProjectId(project.id);
    setCloudProjectName(project.name);
    pushLog(`☁️ Loaded: "${project.name}"`, 'info');
  } catch (err) {
    pushLog(`☁️ Load failed: ${err.message}`, 'warn');
  }
}

/** Fetch current user's project list. */
export async function loadUserProjects() {
  setProjectsLoading(true);
  try {
    const { data, error } = await apiFetch();
    if (!error && data) setUserProjects(data);
  } finally {
    setProjectsLoading(false);
  }
}

/** Delete a cloud project. */
export async function deleteCloudProject(id) {
  const { error } = await apiDelete(id);
  if (!error) {
    setUserProjects(prev => prev.filter(p => p.id !== id));
    if (cloudProjectId() === id) {
      setCloudProjectId(null);
      setCloudProjectName('Untitled');
    }
    pushLog('☁️ Project deleted', 'info');
  }
}
