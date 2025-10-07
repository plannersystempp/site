import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      personnel: {
        Row: {
          id: string;
          team_id: string;
          pix_key_encrypted: string | null;
        };
        Update: {
          pix_key_encrypted?: string | null;
        };
      };
    };
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { pathname } = new URL(req.url);
    const action = pathname.split('/').pop();

    if (action === 'set') {
      return await handleSetPixKey(req, supabaseClient);
    } else if (action === 'get') {
      return await handleGetPixKeys(req, supabaseClient);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in pix-key function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleSetPixKey(req: Request, supabaseClient: any) {
  try {
    const { personnel_id, pix_key } = await req.json();

    if (!personnel_id || !pix_key) {
      return new Response(JSON.stringify({ error: 'Missing personnel_id or pix_key' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Encrypt the PIX key
    const encryptedPixKey = await encryptPixKey(pix_key);

    // Update the personnel record (RLS will ensure only admins can do this)
    const { error } = await supabaseClient
      .from('personnel')
      .update({ pix_key_encrypted: encryptedPixKey })
      .eq('id', personnel_id);

    if (error) {
      console.error('Error updating PIX key:', error);
      return new Response(JSON.stringify({ error: 'Failed to update PIX key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleSetPixKey:', error);
    return new Response(JSON.stringify({ error: 'Failed to set PIX key' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleGetPixKeys(req: Request, supabaseClient: any) {
  try {
    const { personnel_ids } = await req.json();

    if (!personnel_ids || !Array.isArray(personnel_ids)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid personnel_ids' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get personnel records (RLS will ensure only admins can access this)
    const { data, error } = await supabaseClient
      .from('personnel')
      .select('id, team_id, pix_key_encrypted')
      .in('id', personnel_ids);

    if (error) {
      console.error('Error fetching personnel:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch personnel' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decrypt PIX keys
    const pixKeys: Record<string, string> = {};
    
    for (const personnel of data || []) {
      if (personnel.pix_key_encrypted) {
        try {
          const decryptedKey = await decryptPixKey(personnel.pix_key_encrypted);
          pixKeys[personnel.id] = decryptedKey;
        } catch (decryptError) {
          console.error(`Error decrypting PIX key for personnel ${personnel.id}:`, decryptError);
          // Don't include failed decryptions in the result
        }
      }
    }

    return new Response(JSON.stringify({ pix_keys: pixKeys }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleGetPixKeys:', error);
    return new Response(JSON.stringify({ error: 'Failed to get PIX keys' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function encryptPixKey(plaintext: string): Promise<string> {
  const key = Deno.env.get('PIX_ENCRYPTION_KEY');
  if (!key) {
    throw new Error('PIX_ENCRYPTION_KEY not configured');
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32)); // Ensure 32 bytes for AES-256
  const data = encoder.encode(plaintext);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Return base64 encoded
  return btoa(String.fromCharCode(...combined));
}

async function decryptPixKey(encrypted: string): Promise<string> {
  const key = Deno.env.get('PIX_ENCRYPTION_KEY');
  if (!key) {
    throw new Error('PIX_ENCRYPTION_KEY not configured');
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32)); // Ensure 32 bytes for AES-256
  
  // Decode base64
  const combined = new Uint8Array(
    atob(encrypted)
      .split('')
      .map(char => char.charCodeAt(0))
  );

  const iv = combined.slice(0, 12); // First 12 bytes are IV
  const encryptedData = combined.slice(12); // Rest is encrypted data

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encryptedData
  );

  return decoder.decode(decrypted);
}