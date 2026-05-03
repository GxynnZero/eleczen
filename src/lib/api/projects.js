// =============================================================
// src/lib/api/projects.js — Cloud project CRUD via Supabase
// =============================================================
import { supabase } from '../supabase.js';

/**
 * Fetch all projects for the current user.
 * @returns {Promise<{ data: any[], error: any }>}
 */
export async function fetchProjects() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  return supabase
    .from('projects')
    .select('id, name, description, thumbnail, updated_at, is_public')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
}

/**
 * Fetch a single project by id.
 */
export async function fetchProject(id) {
  return supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
}

/**
 * Save (upsert) a project. Pass `id` to update, omit to create.
 * @param {{ id?: string, name: string, description?: string, circuit: object, is_public?: boolean }} project
 */
export async function saveProject(project) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: authErr || new Error('Not authenticated') };

  const payload = {
    user_id:     user.id,
    name:        project.name,
    description: project.description || '',
    circuit:     project.circuit,
    is_public:   project.is_public ?? false,
    updated_at:  new Date().toISOString(),
  };

  if (project.id) {
    return supabase
      .from('projects')
      .update(payload)
      .eq('id', project.id)
      .eq('user_id', user.id)
      .select()
      .single();
  }

  return supabase
    .from('projects')
    .insert(payload)
    .select()
    .single();
}

/**
 * Delete a project.
 */
export async function deleteProject(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated') };

  return supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
}

/**
 * Browse public projects (community showcase).
 */
export async function fetchPublicProjects({ limit = 20, offset = 0, search = '' } = {}) {
  let query = supabase
    .from('projects')
    .select('id, name, description, thumbnail, updated_at, user_id, profiles(username, avatar_url)')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  return query;
}

/**
 * Fork (copy) a public project into the current user's account.
 */
export async function forkProject(sourceId) {
  const { data: source, error } = await fetchProject(sourceId);
  if (error) return { data: null, error };

  return saveProject({
    name:        `${source.name} (fork)`,
    description: source.description,
    circuit:     source.circuit,
    is_public:   false,
  });
}
