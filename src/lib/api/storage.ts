import { supabase } from '../supabase';

export async function uploadFile(file: File, bucket: string, pathPrefix: string = '') {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { data: null, error: authErr || new Error('Not authenticated') };

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    // Path structure: {userId}/{pathPrefix}/{fileName}
    const basePath = pathPrefix ? `${pathPrefix}/` : '';
    const filePath = `${user.id}/${basePath}${fileName}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) return { data: null, error };

    const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return { data: { ...data, publicUrl: publicUrlData.publicUrl }, error: null };
}
