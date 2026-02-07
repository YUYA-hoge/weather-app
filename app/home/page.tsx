import { Title } from "@/components/index";
import WeatherSection from "@/components/WeatherSection";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

async function getCities() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/city`, { next: { revalidate: 3600 } });
  return res.ok ? res.json() : [];
}

export default async function HomePage() {
  const session = await auth();

  // 未ログインならトップ（ログイン画面）へ戻す
  if (!session) {
    redirect("/");
  }

  const initialCities = await getCities();

  return (
    <main className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 flex flex-col items-center gap-6">
        <div className="w-full flex justify-between items-center text-sm text-gray-600">
          <span>{session.user?.name}さん、こんにちは</span>
          <form action={async () => { "use server"; await signOut(); }}>
            <button className="text-red-500 hover:underline">ログアウト</button>
          </form>
        </div>
        <Title />
        <WeatherSection initialCities={initialCities} />
      </div>
    </main>
  );
}