import { createRemoteJWKSet, jwtVerify } from 'jose'
import { budgets, leadStatuses, projectStatuses, projectTypes, timings } from '../src/intake'
import type { Inquiry } from '../src/intake'

interface Env {
  ASSETS: Fetcher
  DB: D1Database
  ACCESS_ISSUER?: string
  ACCESS_AUDIENCE?: string
  LOCAL_ADMIN_PASSWORD?: string
}

const json = (data: unknown, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
})
const error = (message: string, status: number) => json({ message }, status)
const keys = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

async function isAdmin(request: Request, env: Env, url: URL) {
  if (url.protocol === 'http:' && url.hostname === 'localhost' && env.LOCAL_ADMIN_PASSWORD) {
    const expected = 'Basic ' + btoa('admin:' + env.LOCAL_ADMIN_PASSWORD)
    return request.headers.get('Authorization') === expected
  }

  const token = request.headers.get('Cf-Access-Jwt-Assertion')
  const issuer = env.ACCESS_ISSUER
  if (!token || !issuer || !env.ACCESS_AUDIENCE || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer)) return false

  try {
    let jwks = keys.get(issuer)
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer))
      keys.set(issuer, jwks)
    }
    await jwtVerify(token, jwks, {
      issuer,
      audience: env.ACCESS_AUDIENCE,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'sub', 'email'],
    })
    return true
  } catch {
    return false
  }
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json' || !request.body) return null
  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: false })
  let size = 0
  let raw = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 16_384) return null
      raw += decoder.decode(value, { stream: true })
    }
    const parsed: unknown = JSON.parse(raw + decoder.decode())
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null
  } catch {
    return null
  } finally {
    await reader.cancel().catch(() => {})
  }
}

function field(body: Record<string, unknown>, key: string, max: number) {
  const value = body[key]
  return typeof value === 'string' && value.length <= max ? value.trim() : null
}

async function saveInquiry(request: Request, env: Env) {
  const body = await readBody(request)
  if (!body) return error('The inquiry could not be read.', 400)
  if (typeof body.website === 'string' && body.website.trim()) return json({}, 201)

  const id = field(body, 'inquiryId', 36)
  const name = field(body, 'name', 120)
  const email = field(body, 'email', 254)
  const company = field(body, 'company', 160)
  const projectType = field(body, 'projectType', 80)
  const goal = field(body, 'goal', 3000)
  const timing = field(body, 'timing', 40)
  const budget = body.budget === undefined ? '' : field(body, 'budget', 40)
  if (!id || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(id) || !name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || company === null ||
      !projectTypes.some(option => option === projectType) || !goal ||
      !(timing === '' || timings.some(option => option === timing)) ||
      !(budget === '' || budgets.some(option => option === budget))) {
    return error('Check your contact details and project answers, then try again.', 400)
  }

  const now = new Date().toISOString()
  await env.DB.prepare(`
    INSERT INTO inquiries (id, name, email, company, project_type, goal, timing, budget, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO NOTHING
  `).bind(id, name, email, company, projectType, goal, timing, budget, now, now).run()
  return json({}, 201)
}

async function updateInquiry(request: Request, env: Env, id: string) {
  const body = await readBody(request)
  if (!body) return error('The changes could not be read.', 400)

  const leadStatus = field(body, 'leadStatus', 20)
  const projectName = field(body, 'projectName', 160)
  const projectStatus = field(body, 'projectStatus', 20)
  const notes = field(body, 'notes', 3000)
  const version = body.version
  if (!leadStatuses.some(option => option === leadStatus) || projectName === null ||
      notes === null || typeof version !== 'number' || !Number.isSafeInteger(version) || version < 0 ||
      !(projectName ? projectStatuses.some(option => option === projectStatus) : projectStatus === '')) {
    return error('Check the status, project name, and notes, then try again.', 400)
  }

  const updated = await env.DB.prepare(`
    UPDATE inquiries SET lead_status = ?, project_name = ?, project_status = ?, notes = ?, updated_at = ?, revision = revision + 1
    WHERE id = ? AND revision = ? RETURNING *
  `).bind(leadStatus, projectName || null, projectStatus || null, notes, new Date().toISOString(), id, version).first<Inquiry>()
  if (!updated) return error('This inquiry changed. Reload the portal and try again.', 409)
  return json(updated)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    const adminPage = pathname === '/admin' || pathname === '/admin/'
    const adminApi = pathname === '/api/admin' || pathname.startsWith('/api/admin/')
    if ((adminPage || adminApi) && !await isAdmin(request, env, url)) {
      if (adminPage && url.protocol === 'http:' && url.hostname === 'localhost' && env.LOCAL_ADMIN_PASSWORD) {
        return new Response('Local admin sign-in required.', {
          status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Teske.sh local admin"', 'Cache-Control': 'no-store' },
        })
      }
      return error('Admin access required.', 403)
    }
    if (adminPage) {
      const asset = await env.ASSETS.fetch(new URL('/', url))
      const headers = new Headers(asset.headers)
      headers.set('Cache-Control', 'no-store')
      headers.set('X-Robots-Tag', 'noindex')
      return new Response(asset.body, { status: asset.status, headers })
    }
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
    if (['POST', 'PATCH'].includes(request.method) && request.headers.get('Origin') !== url.origin) {
      return error('This request must come from teske.sh.', 403)
    }

    try {
      if (pathname === '/api/inquiries' && request.method === 'POST') return await saveInquiry(request, env)
      if (pathname === '/api/admin/inquiries' && request.method === 'GET') {
        const page = Number(url.searchParams.get('page') ?? '1')
        if (!Number.isSafeInteger(page) || page < 1 || page > 100_000) return error('Invalid page.', 400)
        const projects = url.searchParams.get('view') === 'projects'
        const { results } = await env.DB.prepare(`
          SELECT * FROM inquiries
          WHERE (? = 0 OR project_name IS NOT NULL)
          ORDER BY created_at DESC, id DESC LIMIT 26 OFFSET ?
        `).bind(Number(projects), (page - 1) * 25).all<Inquiry>()
        return json({ items: results.slice(0, 25), hasNext: results.length > 25 })
      }
      const match = pathname.match(/^\/api\/admin\/inquiries\/([a-f0-9-]{36})$/)
      if (match && request.method === 'PATCH') return await updateInquiry(request, env, match[1])
      return error('This endpoint does not exist.', 404)
    } catch (cause) {
      console.error('Database request failed', cause instanceof Error ? cause.name : 'Unknown error')
      return error('The request could not be saved or loaded. Please try again.', 503)
    }
  },
} satisfies ExportedHandler<Env>
