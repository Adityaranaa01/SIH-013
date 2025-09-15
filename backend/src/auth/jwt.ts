import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const COOKIE_NAME = 'st_admin'
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 8 // 8h
}

// Add explicit domain for localhost in dev to help curl and some clients store it
if (process.env.NODE_ENV !== 'production') {
  ;(COOKIE_OPTIONS as any).domain = 'localhost'
}

export function signSession(payload: { id: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export function verifySession(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; name: string; iat: number; exp: number }
  } catch {
    return null
  }
}

export { COOKIE_NAME, COOKIE_OPTIONS }
