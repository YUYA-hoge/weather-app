"use client";

import { useState } from "react";
import { Button } from "@/components/index";
import CityInput from "./CityInput"; // さっき作ったMUIのAutocomplete

export default function WeatherSection({ initialCities }: { initialCities: [] }) {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState("");
    const [temp, setTemp] = useState<number | null>(null);

    const handleSearch = async () => {
    if (!city) return;
    const response = await fetch(`/api/weather?city=${city}`);
    const data = await response.json();

    if (data.error) {
        setWeather(data.error);
        setTemp(null);
    } else {
        setWeather(data.weather);
        setTemp(data.temp);
    }
    };

    return (
    <div className="w-full flex flex-col items-center gap-6">
        <CityInput 
        label="都市を選択" 
        cities={initialCities} 
        onChange={setCity} 
        />
        <Button label="検索" onClick={handleSearch} />

        {weather && (
        <p className="text-2xl font-bold text-gray-700 animate-bounce">
            {weather}
        </p>
        )}
        {temp !== null && (
        <p className="text-2xl font-bold text-gray-700">
            {temp}℃
        </p>
        )}
    </div>
    );
}