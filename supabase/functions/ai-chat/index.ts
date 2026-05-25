import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationHistory } = await req.json()

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    })

    // Fetch AI Settings
    const { data: aiSettings, error: settingsError } = await supabase
      .from('ai_settings')
      .select('*')
      .limit(1)
      .single()

    if (settingsError || !aiSettings) {
      throw new Error('AI settings not configured')
    }

    if (aiSettings.chat_mode === 'lead_capture') {
      return new Response(JSON.stringify({ error: 'AI is disabled.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const provider = aiSettings.provider
    const apiKey = aiSettings.api_key
    const model = aiSettings.model
    const systemPrompt = aiSettings.system_prompt
    const temperature = aiSettings.temperature || 0.7

    if (!apiKey) {
      throw new Error('API key is missing in AI settings')
    }

    let reply = ''

    if (provider === 'gemini') {
      // Formata histórico para Gemini
      const contents = conversationHistory.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
      
      // Adiciona nova mensagem
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      })

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: parseFloat(temperature) }
        })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || 'Failed to call Gemini')
      
      reply = data.candidates[0].content.parts[0].text
    } 
    else if (provider === 'openrouter' || provider === 'openai' || provider === 'groq') {
      const baseUrl = provider === 'openrouter' 
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : provider === 'groq' 
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions'

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ]

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: parseFloat(temperature)
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || 'Failed to call provider API')
      
      reply = data.choices[0].message.content
    } else {
      throw new Error('Unsupported provider')
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error processing AI request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
