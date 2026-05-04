// =============================================================
// src/lib/api/components.js — Catalog & Community component library
// =============================================================
import { supabase } from '../supabase';

/**
 * Fetch components.
 */
export async function fetchCloudComponents({ search = '', tags = [], category = '', limit = 30 } = {}) {
  let query = supabase
    .from('components')
    .select('id, name, slug, category, description, tags, specifications, symbol_svg, image_url, manufacturer, part_number, verified, rating, downloads, user_id, profiles(username)')
    .eq('verified', true)
    .order('downloads', { ascending: false })
    .limit(limit);

  if (search) {
    query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (tags.length) {
    query = query.overlaps('tags', tags);
  }

  if (category) {
    query = query.eq('category', category);
  }

  return query;
}

/**
 * Fetch a single component by id or slug.
 */
export async function fetchCloudComponent(idOrSlug) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  return supabase
    .from('components')
    .select('*')
    .or(isUuid ? `id.eq.${idOrSlug}` : `slug.eq.${idOrSlug}`)
    .single();
}

/**
 * Publish a new component.
 */
export async function publishCloudComponent(component) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: authErr || new Error('Not authenticated') };

  return supabase.from('components').insert({
    user_id:        user.id,
    name:           component.name,
    slug:           component.slug || null,
    description:    component.description || '',
    category:       component.category || 'other',
    specifications: component.specifications || {},
    datasheet_url:  component.datasheet_url || '',
    pinout_image:   component.pinout_image || '',
    pricing:        component.pricing || {},
    tags:           component.tags || [],
    symbol_svg:     component.symbol_svg || '',
    spice_model:    component.spice_model || '',
    verilog_model:  component.verilog_model || '',
    image_url:      component.image_url || '',
    manufacturer:   component.manufacturer || '',
    part_number:    component.part_number || '',
    verified:       false,
  }).select().single();
}

/**
 * Update an existing component.
 */
export async function updateCloudComponent(id, component) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: authErr || new Error('Not authenticated') };

  return supabase.from('components').update({
    name:           component.name,
    slug:           component.slug || null,
    description:    component.description || '',
    category:       component.category || 'other',
    specifications: component.specifications || {},
    datasheet_url:  component.datasheet_url || '',
    pinout_image:   component.pinout_image || '',
    pricing:        component.pricing || {},
    tags:           component.tags || [],
    symbol_svg:     component.symbol_svg || '',
    spice_model:    component.spice_model || '',
    verilog_model:  component.verilog_model || '',
    image_url:      component.image_url || '',
    manufacturer:   component.manufacturer || '',
    part_number:    component.part_number || '',
    verified:       false, // reset verification on edit
  }).eq('id', id).eq('user_id', user.id).select().single();
}

/**
 * Delete a component.
 */
export async function deleteCloudComponent(id) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: authErr || new Error('Not authenticated') };

  return supabase.from('components')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
}

/**
 * Increment the download counter.
 */
export async function incrementDownloads(id) {
  return supabase.rpc('increment_component_downloads', { component_id: id });
}
