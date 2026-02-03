import { Button as MuiButton } from "@mui/material";

type Props = {
  label: string;
  onClick: () => void; // クリック時の関数を受け取る
};

export default function Button({ label, onClick }: Props) {
  return (
    <MuiButton 
      variant="contained" 
      fullWidth 
      onClick={onClick}
      sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold' }}
    >
      {label}
    </MuiButton>
  );
}