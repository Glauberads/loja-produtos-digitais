import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import postgres from 'https://deno.land/x/postgresjs/mod.js'

serve(async (req: Request) => {
  try {
    const connectionString = Deno.env.get('SUPABASE_DB_URL')!
    const sql = postgres(connectionString)

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS checkout_banner_url TEXT;`
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS checkout_side_image_url TEXT;`
    
    // Refresh schema cache so postgrest-js detects the new columns
    await sql`NOTIFY pgrst, 'reload schema';`

    return new Response(JSON.stringify({ ok: true, message: 'Columns added' }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
