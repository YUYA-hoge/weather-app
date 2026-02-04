"use client";

import { Autocomplete, TextField } from "@mui/material";

// 型定義
interface City {
  id: number;
  name: string;
  jpName: string;
}

type Props = {
  label: string;
  cities: City[]; // サーバーから受け取るデータ
  onChange: (val: string) => void;
};

export default function CityInput({ label, cities, onChange }: Props) {
  return (
    <Autocomplete
      options={cities}
      getOptionLabel={(option) => `${option.jpName} (${option.name})`}
      fullWidth
      onChange={(_event, newValue) => {
        if (newValue) {
          onChange(newValue.name);
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
    />
  );
}