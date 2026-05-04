// =============================================================
// src/lib/api/cloudComponents.js — Community component library
// =============================================================
import { supabase } from '../supabase';

/**
 * Fetch community components.
 * Each record: { id, name, type, symbol_svg, spice_netlist, description, author, downloads, tags[] }
 */
export async function fetchCloudComponents({ search = '', tags = [], limit = 30 } = {}) {
  let query = supabase
    .from('cloud_components')
    .select('id, name, type, symbol_svg, description, tags, downloads, author_id, profiles(username)')
    .eq('approved', true)
    .order('downloads', { ascending: false })
    .limit(limit);

  if (search) {
    query = query.or(`name.ilike.%${search}%,type.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (tags.length) {
    query = query.overlaps('tags', tags);
  }

  return query;
}

/**
 * Fetch a single cloud component by id (full record including SPICE netlist).
 */
export async function fetchCloudComponent(id) {
  return supabase
    .from('cloud_components')
    .select('*')
    .eq('id', id)
    .single();
}

/**
 * Publish a new community component.
 */
export async function publishCloudComponent(component) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: authErr || new Error('Not authenticated') };

  return supabase.from('cloud_components').insert({
    author_id:     user.id,
    name:          component.name,
    type:          component.type,
    symbol_svg:    component.symbol_svg || '',
    spice_netlist: component.spice_netlist || '',
    description:   component.description || '',
    tags:          component.tags || [],
    approved:      false, // pending moderation
  }).select().single();
}

/**
 * Increment the download counter for a component.
 */
export async function incrementDownloads(id) {
  return supabase.rpc('increment_component_downloads', { component_id: id });
}
