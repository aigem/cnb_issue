import type { NextRequest } from "next/server"
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export interface AdminUser {
  username: string
  role: "admin"
}

export async function createToken(user: AdminUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as AdminUser
  } catch {
    return null
  }
}

export function validateCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME || "admin"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

  return username === adminUsername && password === adminPassword
}

export async function getAuthUser(request: NextRequest): Promise<AdminUser | null> {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  return await verifyToken(token)
}
