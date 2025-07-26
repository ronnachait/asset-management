// import { createServerClient } from '@supabase/ssr'
// import { NextResponse, type NextRequest } from 'next/server'

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({ request })

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll()
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
//           supabaseResponse = NextResponse.next({ request })
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           )
//         },
//       },
//     }
//   )

//   // ดึงข้อมูลผู้ใช้จาก session
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   const pathname = request.nextUrl.pathname
//   const PUBLIC_PATHS = ['/login', '/register']

//   const isPublic =
//     PUBLIC_PATHS.includes(pathname) ||
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/favicon.ico') ||
//     pathname.startsWith('/api/login') ||
//     pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
//   // ถ้าไม่ได้ login และไม่ใช่ path ที่ public → redirect
//   if (!user && !isPublic) {
//     const loginUrl = new URL('/login', request.url)
//     loginUrl.searchParams.set('callbackUrl', pathname)
//     return NextResponse.redirect(loginUrl)
//   }

//   return supabaseResponse
// }
