import { Title, ButtonAppBar } from "@/components/index";
import WeatherSection from "@/components/WeatherSection";
import { auth } from "@/auth";
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
    <main className="bg-gray-50 min-h-screen flex flex-col">
      <ButtonAppBar user={session.user}/>

      {/* justify-center を外し、上部にパディングを入れる */}
      <div className="flex-1 flex flex-col items-center pt-20 p-4">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <Title />
          <WeatherSection initialCities={initialCities} />
        </div>
      </div>
    </main>
  );
}