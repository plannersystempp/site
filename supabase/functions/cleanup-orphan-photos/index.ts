import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Starting orphan photos cleanup...');

    // 1. Buscar todas as fotos no bucket personnel-photos
    const { data: allFiles, error: listError } = await supabaseClient.storage
      .from('personnel-photos')
      .list();

    if (listError) {
      throw new Error(`Error listing files: ${listError.message}`);
    }

    console.log(`Found ${allFiles?.length || 0} files in storage`);

    // 2. Buscar todas as URLs de fotos referenciadas no banco
    const { data: personnel, error: dbError } = await supabaseClient
      .from('personnel')
      .select('photo_url')
      .not('photo_url', 'is', null);

    if (dbError) {
      throw new Error(`Error fetching personnel: ${dbError.message}`);
    }

    const referencedFiles = new Set(
      personnel?.map(p => {
        if (!p.photo_url) return null;
        const parts = p.photo_url.split('/');
        return parts[parts.length - 1];
      }).filter(Boolean) || []
    );

    console.log(`Found ${referencedFiles.size} referenced photos in database`);

    // 3. Identificar fotos órfãs (não referenciadas e mais antigas que 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orphanFiles = allFiles?.filter(file => {
      const isReferenced = referencedFiles.has(file.name);
      const isOld = new Date(file.created_at) < sevenDaysAgo;
      return !isReferenced && isOld;
    }) || [];

    console.log(`Found ${orphanFiles.length} orphan photos to delete`);

    // 4. Deletar fotos órfãs
    let deletedCount = 0;
    let errorCount = 0;

    for (const file of orphanFiles) {
      try {
        const { error: deleteError } = await supabaseClient.storage
          .from('personnel-photos')
          .remove([file.name]);

        if (deleteError) {
          console.error(`Error deleting ${file.name}:`, deleteError);
          errorCount++;
        } else {
          console.log(`Deleted orphan photo: ${file.name}`);
          deletedCount++;
        }
      } catch (err) {
        console.error(`Exception deleting ${file.name}:`, err);
        errorCount++;
      }
    }

    const result = {
      success: true,
      totalFiles: allFiles?.length || 0,
      referencedFiles: referencedFiles.size,
      orphanFiles: orphanFiles.length,
      deletedCount,
      errorCount,
      message: `Cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`
    };

    console.log('Cleanup result:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in cleanup-orphan-photos:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
