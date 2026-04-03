import { corsHeaders } from '@supabase/supabase-js/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { base_url, api_key, provider_type } = await req.json()

    if (!base_url) {
      return new Response(JSON.stringify({ ok: false, status: 0, message: '缺少服务地址' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cleanUrl = base_url.replace(/\/+$/, '').replace(/^ws(s?):\/\//, 'http$1://')
    const testUrl = provider_type === 'openclaw'
      ? `${cleanUrl}/health`
      : `${cleanUrl}/models`

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (api_key) headers['Authorization'] = `Bearer ${api_key}`

    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 15000)

    const resp = await fetch(testUrl, { method: 'GET', headers, signal: controller.signal })
    clearTimeout(tid)
    await resp.text() // consume body

    let message: string
    let ok = false
    if (resp.ok) {
      ok = true
      message = '连接成功！服务可达'
    } else if (resp.status === 401 || resp.status === 403) {
      message = '认证失败，请检查 API Key'
    } else if (resp.status === 404) {
      message = '接口未找到，请检查服务地址'
    } else {
      message = `服务返回 ${resp.status}，请检查配置`
    }

    return new Response(JSON.stringify({ ok, status: resp.status, message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err.name === 'AbortError'
      ? '连接超时（15秒），请检查地址是否可达'
      : `连接失败: ${err.message}`

    return new Response(JSON.stringify({ ok: false, status: 0, message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
