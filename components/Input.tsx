import { Autocomplete, TextField } from "@mui/material";
import cityList from "@/lib/japan-cities.json";

type Props = {
  label: string;
  onChange: (val: string) => void;
};

export default function CityInput({ label, onChange }: Props) {
  return (
    <Autocomplete
      options={cityList}
      getOptionLabel={(option) => `${option.jpName} (${option.name})`}
      fullWidth
      onChange={(_event, newValue) => {
        // OpenWeatherは英語名で検索する必要があるので .name を渡す
        if (newValue) onChange(newValue.name);
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
    />
  );
}