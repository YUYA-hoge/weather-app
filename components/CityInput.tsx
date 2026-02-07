"use client";

import { Autocomplete, TextField } from "@mui/material";

interface City {
  id: number;
  name: string;
  jpName: string;
}

type Props = {
  label: string;
  cities: City[];
  value: City | null; // 追加：現在選択されている都市オブジェクト
  onChange: (city: City | null) => void; // 修正：Cityオブジェクトごと渡す
};

export default function CityInput({ label, cities, value, onChange }: Props) {
  return (
    <Autocomplete
      id="city-autocomplete"
      options={cities}
      value={value} // 親からの状態を反映
      getOptionLabel={(option) => `${option.jpName} (${option.name})`}
      fullWidth
      onChange={(_event, newValue) => {
        onChange(newValue); // 親に選択結果を伝える
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
    />
  );
}