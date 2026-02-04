import { Title } from "@/components/index";
import WeatherSection from "@/components/WeatherSection";

// サーバー側で都市リストを事前に取得
async function getCities() {
  // 開発環境と本番環境で切り替えられるようにするのが一般的です
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const res = await fetch(`${baseUrl}/api/city`, { 
    next: { revalidate: 3600 } 
  });
  
  return res.ok ? res.json() : [];
}

export default async function Home() {
  const initialCities = await getCities();

  return (
    <main className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 flex flex-col items-center gap-6">
        <Title />
        {/* 動きが必要な部分は、クライアントコンポーネントへ切り出す */}
        <WeatherSection initialCities={initialCities} />
      </div>
    </main>
  );
}