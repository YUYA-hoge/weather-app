"use client";

import { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";

// 1. Supabaseのテーブル構造に合わせた型定義
interface City {
  id: number;
  name: string;
  jpName: string;
}

type Props = {
  label: string;
  onChange: (val: string) => void;
};

export default function CityInput({ label, onChange }: Props) {
  const [options, setOptions] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  // 2. コンポーネント作成時にAPIからデータを取得
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/city");
        const data = await response.json();
        
        // APIが配列を返すことを期待
        if (Array.isArray(data)) {
          setOptions(data);
        }
      } catch (error) {
        console.error("都市リストの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return (
    <Autocomplete
      options={options}
      loading={loading}
      getOptionLabel={(option) => `${option.jpName} (${option.name})`}
      fullWidth
      // 選択された時の処理
      onChange={(_event, newValue) => {
        if (newValue) {
          onChange(newValue.name); // OpenWeather用の英語名を渡す
        }
      }}
      // 検索・表示部分
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}