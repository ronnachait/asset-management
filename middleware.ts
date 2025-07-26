import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const isPublic =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/qrcode-icon.ico") ||
    pathname.startsWith("/api/login") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/);

  if (isPublic) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname !== "/login") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // ถ้า path คือ /login และ user ยังไม่มี session ให้ผ่านไปปกติ
    return response;
  }

  // เช็ค role สำหรับ path จำกัดสิทธิ์
  const restrictedPaths = [
    "/reports",
    "/users",
    "/equipment",
    "/transactions",
    "/notifications",
    "/borrow-orders",
    "/admin-setting",
  ];

  if (restrictedPaths.includes(pathname)) {
    const { data: roleData, error } = await supabase
      .from("accounts")
      .select("access_level")
      .eq("id", user.id)
      .single();
    const accessLevel = roleData?.access_level ?? 0;

    if (error || accessLevel <= 50) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
