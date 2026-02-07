import { Title } from "@/components/index";
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
    <main className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm flex flex-col items-center gap-6">
        <Title />
        <SignIn />
      </div>
    </main>
  );
}