import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ════════════════════════════════════════════════════════════════════════
// Control de acceso a las PÁGINAS. El de la API vive en cada handler, con
// los guards de lib/session-aupair.js — ver docs/rutas-y-acceso.md.
//
// Hasta el Sprint 1 este archivo servía a dos aplicaciones: Destino Au Pair y
// "Project Center", una app ajena del proveedor anterior con su propio
// secreto JWT, su propio mapa de roles y su propia cookie. Se retiró: su base
// de datos no existía en el servidor. Aquí queda sólo Destino Au Pair.
// ════════════════════════════════════════════════════════════════════════

const JWT_SECRET_DAP = new TextEncoder().encode(
  process.env.JWT_AUPAIR_SECRET || "destino_aupair_secreto_2025"
);

// Prefijos que exigen sesión, y el rol que puede entrar a cada uno.
// `null` = cualquier rol con sesión válida.
const RUTAS_PROTEGIDAS = [
  { prefijo: "/admin",     rol: "admin"    },
  { prefijo: "/asociada",  rol: "asociada" },
  { prefijo: "/agencia",   rol: "agencia"  },
  { prefijo: "/dashboard", rol: null       },
];

// Páginas y rutas que responden sin sesión.
const PUBLICAS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/me",
];

const empieza = (pathname, p) => pathname === p || pathname.startsWith(p + "/");

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Assets y archivos internos de Next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (PUBLICAS.some((p) => empieza(pathname, p))) return NextResponse.next();

  const regla = RUTAS_PROTEGIDAS.find((r) => empieza(pathname, r.prefijo));
  if (!regla) return NextResponse.next();

  const token = request.cookies.get("dap_token")?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(token, JWT_SECRET_DAP));
  } catch {
    // Token inválido o vencido: se borra para no dejar al usuario en un
    // bucle de redirecciones con una cookie que nunca se va a verificar.
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set("dap_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  // El rol manda sobre el prefijo. Quien no corresponde va a su propio panel.
  if (regla.rol && payload.rol !== regla.rol) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Identidad para los handlers. NO es autorización: cada ruta de la API
  // verifica la sesión por su cuenta con los guards de lib/session-aupair.js.
  const cabeceras = new Headers(request.headers);
  cabeceras.set("x-dap-user-id",     String(payload.id     || ""));
  cabeceras.set("x-dap-user-email",  String(payload.email  || ""));
  cabeceras.set("x-dap-user-nombre", String(payload.nombre || ""));
  cabeceras.set("x-dap-user-rol",    String(payload.rol    || ""));
  cabeceras.set("x-dap-acceso",      String(payload.tiene_acceso || "false"));

  return NextResponse.next({ request: { headers: cabeceras } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
