"use client"
import { Title, Input, Button } from "@/components/index"
import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(""); // 文字列として初期化

  const handleSearch = async () => {
    if (!city) return;

    const response = await fetch(`/api/weather?city=${city}`);
    const data = await response.json();
    
    console.log(data);

    if (data.error) {
      setWeather(data.error); // エラーメッセージを表示
    } else {
      // route.tsで返している「weather（説明文）」をセット
      setWeather(data.weather); 
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 flex flex-col items-center gap-6">
        <Title />
        <Input label="都市を入力" onChange={setCity} />
        <Button label="検索" onClick={handleSearch} />
        
        {/* 天気のテキストをシンプルに表示 */}
        {weather && (
          <p className="text-2xl font-bold text-gray-700 animate-bounce">
            {weather}
          </p>
        )}
      </div>
    </main>
  );
}