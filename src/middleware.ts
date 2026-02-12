import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Define Public Routes (Always accessible)
    // - /login
    // - /miniapp (BUT NOT /miniapp/admin)
    // - /api/auth/* (Login/Logout)
    // - /api/questions (GET only)
    // - /api/categories (GET only)

    const isStaticFile = path.match(/\.(svg|png|jpg|jpeg|gif|webp|webmanifest|ico)$/);

    const isPublicPage =
        path === "/login" ||
        (path.startsWith("/miniapp") && !path.startsWith("/miniapp/admin")) ||
        isStaticFile;

    const isPublicApi =
        path.startsWith("/api/auth") ||
        (path.startsWith("/api/questions") && request.method === "GET") ||
        (path.startsWith("/api/categories") && request.method === "GET") ||
        path === "/api/analytics/track";

    if (isPublicPage || isPublicApi) {
        return NextResponse.next();
    }

    // 2. Everything else is Protected
    // This includes:
    // - / (Root)
    // - /miniapp/admin/*
    // - /api/admin/*
    // - /api/questions (POST/PUT/DELETE)
    // - /stats/*

    const cookie = request.cookies.get("admin_session");

    if (!cookie) {
        if (path.startsWith("/api")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await decrypt(cookie.value);

    if (!session) {
        if (path.startsWith("/api")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Match all paths except static files and images
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
