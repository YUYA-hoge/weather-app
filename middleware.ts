// middleware.ts
import { auth } from "@/auth"

// デフォルトエクスポートとして auth を渡す
export default auth

export const config = {
  // ログインが必要なパスを指定
  matcher: ["/home/:path*"],
}