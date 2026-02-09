import { Title, ButtonAppBar } from "@/components/index";
import SignIn from "@/components/sign-in";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  // すでにログインしているなら /home へ飛ばす
  if (session) {
    redirect("/home");
  }

  return (
    // min-h-screen を保ちつつ、中身を縦に並べる
    <main className="bg-gray-50 min-h-screen flex flex-col">
      {/* 1. 画面上部に配置 */}
      <ButtonAppBar />

      {/* 2. 残りのスペース（flex-1）を使ってカードを中央配置 */}
      <div className="flex-1 flex flex-col items-center pt-20 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm flex flex-col items-center gap-6">
          <Title />
          <p className="text-gray-500 text-sm text-center">
            ログインして、お気に入りの都市の天気をチェックしましょう。
          </p>
          <SignIn />
        </div>
      </div>
    </main>
  );
}