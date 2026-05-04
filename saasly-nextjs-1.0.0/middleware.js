import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ── Secrets ────────────────────────────────────────────
const JWT_SECRET_PC = new TextEncoder().encode(
  process.env.JWT_SECRET || "proyecto_center_secreto_2024"
);
const JWT_SECRET_DAP = new TextEncoder().encode(
  process.env.JWT_AUPAIR_SECRET || "destino_aupair_secreto_2025"
);

// ── Project Center config ───────────────────────────────
const ROLE_ROUTES = {
  "Super Admin":      ["/dashboard"],
  "Admin Empresa":    ["/app/dashboard"],
  "Gerente Proyecto": ["/app/dashboard"],
  "Contratista":      ["/app/dashboard"],
  "Contador":         ["/app/dashboard"],
  "Cliente":          ["/app/cliente"],
};

const ROLE_HOME = {
  "Super Admin":      "/dashboard",
  "Admin Empresa":    "/company",
  "Gerente Proyecto": "/company",
  "Contratista":      "/dashboard",
  "Contador":         "/company/projects",
  "Cliente":          "/client",
};

const PC_PROTECTED_PREFIXES = [
  "/app/dashboard",
  "/app/cliente",
  "/editor-planos",
];

// ── Destino Au Pair config ──────────────────────────────
const DAP_PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
];

const DAP_PUBLIC_PATHS = [
  "/login",
  "/register",
  "/",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/me",
];

// ── Paths siempre públicos ──────────────────────────────
const ALWAYS_PUBLIC = [
  "/login",
  "/register",
  "/",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/register-cliente",
  "/api/auth/logout",
  "/api/auth/me",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip assets y Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Siempre públicos
  if (ALWAYS_PUBLIC.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // ── ¿Es ruta de Destino Au Pair? ──────────────────────
  const isDapRoute = DAP_PROTECTED_PREFIXES.some(p =>
    pathname === p || pathname.startsWith(p + "/")
  );

  if (isDapRoute) {
    const dapToken = request.cookies.get("dap_token")?.value;

    if (!dapToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    let payload;
    try {
      const { payload: decoded } = await jwtVerify(dapToken, JWT_SECRET_DAP);
      payload = decoded;
    } catch {
      const loginUrl = new URL("/login", request.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.set("dap_token", "", { maxAge: 0, path: "/" });
      return res;
    }

    // Admin solo puede ir a /admin, usuaria solo a /dashboard
    if (pathname.startsWith("/admin") && payload.rol !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Adjunta info del usuario a los headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-dap-user-id",     String(payload.id      || ""));
    requestHeaders.set("x-dap-user-email",  String(payload.email   || ""));
    requestHeaders.set("x-dap-user-nombre", String(payload.nombre  || ""));
    requestHeaders.set("x-dap-user-rol",    String(payload.rol     || ""));
    requestHeaders.set("x-dap-acceso",      String(payload.tiene_acceso || "false"));

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── ¿Es ruta de Project Center? ───────────────────────
  const isPcRoute = PC_PROTECTED_PREFIXES.some(p =>
    pathname === p || pathname.startsWith(p + "/")
  );

  if (!isPcRoute) return NextResponse.next();

  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let payload;
  try {
    const { payload: decoded } = await jwtVerify(token, JWT_SECRET_PC);
    payload = decoded;
  } catch {
    const loginUrl = new URL("/login", request.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set("token", "", { maxAge: 0, path: "/" });
    return res;
  }

  const rol = payload.rol;
  const allowedPrefixes = ROLE_ROUTES[rol] || [];
  const isAllowed = allowedPrefixes.some(p =>
    pathname === p || pathname.startsWith(p + "/")
  );

  if (!isAllowed) {
    const home = ROLE_HOME[rol] || "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id",      String(payload.id        || ""));
  requestHeaders.set("x-user-email",   String(payload.email     || ""));
  requestHeaders.set("x-user-rol",     String(payload.rol       || ""));
  requestHeaders.set("x-user-empresa", String(payload.id_empresa || ""));
  requestHeaders.set("x-user-nombre",  String(payload.nombre    || ""));

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};