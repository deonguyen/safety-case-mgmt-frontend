export { auth as middleware } from "@/src/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (Auth routes)
     * - login (Login page)
     * - _next/static, _next/image, favicon.ico
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
