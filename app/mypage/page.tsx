import { Title, ButtonAppBar } from "@/components/index";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function mypage() {
  const session = await auth();

  // 未ログインならトップ（ログイン画面）へ戻す
  if (!session) {
    redirect("/");
  }
  return (
    <main className="bg-gray-50 min-h-screen flex flex-col">
      <ButtonAppBar user={session.user}/>

      {/* justify-center を外し、上部にパディングを入れる */}
      <div className="flex-1 flex flex-col items-center pt-20 p-4">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <Title title={"マイページ"}/>
        </div>
      </div>
    </main>
  );
}