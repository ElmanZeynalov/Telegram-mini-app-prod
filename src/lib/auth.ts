import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key-change-it"
const key = new TextEncoder().encode(SECRET_KEY)

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key)
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        })
        return payload
    } catch (error) {
        return null
    }
}


export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")?.value
    if (!session) return null
    return await decrypt(session)
}

export async function login(userData: { id: string; email: string; role: string }) {
    // Create the session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    const session = await encrypt({ user: userData, expires })

    const cookieStore = await cookies()
    // Save the session in a cookie
    cookieStore.set("admin_session", session, { expires, httpOnly: true })
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "", { expires: new Date(0) })
}
