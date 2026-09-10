/**
 * requireSession — Supabase session guard for ivor-core's privileged routes.
 *
 * Every ivor-core route acts on the SERVICE ROLE key, so RLS cannot stop a
 * caller: whatever the route does, it does with full database rights. The
 * moderation endpoints therefore need an application-level gate, and this is
 * it. Ported from comms-blkout api/_auth.ts, which is itself the check that
 * guards the openings queue in black-qtipoc-events-calendar
 * (api/pending-openings.ts, api/moderate-opening.ts): verify the caller's
 * `Authorization: Bearer <supabase jwt>` against `${SUPABASE_URL}/auth/v1/user`,
 * using the ANON key as the apikey. Same shape, same `req.user`, so a reader of
 * one recognises the other.
 *
 * Two deliberate departures from comms-blkout's copy:
 *  - config is read at call time, not module load (see readConfig below);
 *  - it does NOT set Access-Control-Allow-Origin. comms-blkout's copy reflects
 *    `req.headers.origin || '*'`, which here would widen ivor-core's existing
 *    cors() allowlist to any origin on exactly the routes that matter most.
 *
 * Fails closed. No new secret: SUPABASE_URL and SUPABASE_ANON_KEY are both
 * already set for this service.
 */

import type { Request, Response, NextFunction } from 'express'

export interface SessionUser {
  id: string
  /** Email if the account has one, else the uuid — never empty. */
  email: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser
    }
  }
}

/**
 * Read config at call time, not module load. server.ts runs dotenv.config()
 * AFTER its imports are evaluated, so anything captured at module scope in an
 * imported file misses a .env-supplied value and silently reads ''.
 */
function readConfig(): { url: string; anonKey: string } {
  return {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || ''
  }
}

/**
 * Verify a bearer token with Supabase. Returns the user, or null for any
 * failure — expired, forged, malformed, or unreachable.
 */
export async function verifySessionToken(authHeader: string | undefined): Promise<SessionUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) return null

  const { url, anonKey } = readConfig()
  if (!url || !anonKey) return null

  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`
      },
      // A hung Supabase must not hang the request. Matches comms-blkout api/_auth.ts.
      signal: AbortSignal.timeout(8000)
    })
    if (!response.ok) return null
    const user: any = await response.json()
    if (!user || !user.id) return null
    return { id: user.id, email: user.email || user.id }
  } catch (error) {
    console.error('[requireSession] Token verification error:', error)
    return null
  }
}

/**
 * Express middleware. Attaches the verified user to req.user.
 * Handlers downstream must use req.user for moderator identity and never a
 * client-supplied moderatorId.
 */
export function requireSessionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Preflight: the global cors() usually answers this first, but if the origin
  // is not on its allowlist the request falls through to here.
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(204).end()
  }

  const { url, anonKey } = readConfig()
  if (!url || !anonKey) {
    console.error('[requireSession] Missing SUPABASE_URL or SUPABASE_ANON_KEY — refusing the request')
    return res.status(500).json({ success: false, error: 'Server misconfigured' })
  }

  verifySessionToken(req.headers.authorization)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ success: false, error: 'Sign in required' })
      }
      req.user = user
      next()
    })
    .catch((error) => {
      console.error('[requireSession] Unexpected error:', error)
      res.status(401).json({ success: false, error: 'Sign in required' })
    })
}

export default requireSessionMiddleware
