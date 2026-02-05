"use client";

import { useState } from "react";
import { Button } from "@/components/index";
import CityInput from "./CityInput";

// 都市データの型定義
interface City {
  id: number;
  name: string;
  jpName: string;
}

export default function WeatherSection({ initialCities }: { initialCities: City[] }) {
  // --- 状態管理 (States) ---
  const [selectedCityObj, setSelectedCityObj] = useState<City | null>(null); // Autocompleteの選択状態
  const [weather, setWeather] = useState("");
  const [temp, setTemp] = useState<number | null>(null);
  const [currentCity, setCurrentCity] = useState(""); // APIから返ってきた都市名
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  // --- 都市名での検索 (通常検索) ---
  const handleSearch = async () => {
    // Autocompleteで選択されている都市名（英語）を使用
    const cityName = selectedCityObj?.name;
    if (!cityName) {
      alert("都市を選択してください");
      return;
    }

    try {
      const response = await fetch(`/api/weather?city=${cityName}`);
      const data = await response.json();

      if (data.error) {
        setWeather(data.error);
        setTemp(null);
        setCurrentCity("");
      } else {
        setWeather(data.weather);
        setTemp(data.temp);
        setCurrentCity(""); // 通常検索時は現在地表示をクリア
        setCoords(null);    // 通常検索時は座標表示をクリア
      }
    } catch (_) {
      setWeather("お天気情報の取得に失敗しました");
    }
  };

  // --- 現在地からの検索 ---
  const handleSearchToPosition = () => {
    if (!navigator.geolocation) {
      alert("お使いのブラウザは位置情報に対応していません");
      return;
    }

    // ✨ 1. 選択されている都市をリセット
    setSelectedCityObj(null);

    // 2. 位置情報をリクエスト
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setCoords({ lat, lon });

        try {
          // 3. 取得した座標でAPIを叩く
          const response = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
          const data = await response.json();

          if (data.error) {
            setWeather(data.error);
            setTemp(null);
            setCurrentCity("");
          } else {
            setWeather(data.weather);
            setTemp(data.temp);
            setCurrentCity(data.name); // APIから返ってきた場所の名前をセット
          }
        } catch (_) {
          setWeather("現在地の天気取得に失敗しました");
        }
      },
      (_) => {
        alert("位置情報の取得を許可するか、設定を確認してください");
      }
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* 都市選択入力 */}
      <CityInput 
        label="都市を選択" 
        cities={initialCities} 
        value={selectedCityObj} 
        onChange={(city) => setSelectedCityObj(city)} 
      />
      
      {/* ボタンエリア */}
      <div className="flex gap-2 w-full">
        <Button label="検索" onClick={handleSearch} />
        <Button label="現在地から検索" onClick={handleSearchToPosition} />
      </div>

      {/* 情報表示エリア */}
      <div className="flex flex-col items-center gap-2 mt-4">
        {/* 現在地の都市名 */}
        {currentCity && (
          <p className="text-lg font-semibold text-blue-600">
            📍 現在地: {currentCity}
          </p>
        )}

        {/* 座標情報 */}
        {coords && (
          <div className="text-xs text-gray-400">
            緯度: {coords.lat.toFixed(2)} / 経度: {coords.lon.toFixed(2)}
          </div>
        )}

        {/* 天気メイン表示 */}
        {weather && (
          <p className="text-3xl font-bold text-gray-700 animate-bounce text-center mt-2">
            {weather}
          </p>
        )}

        {/* 気温表示 */}
        {temp !== null && (
          <p className="text-5xl font-extrabold text-gray-800">
            {temp}℃
          </p>
        )}
      </div>
    </div>
  );
}