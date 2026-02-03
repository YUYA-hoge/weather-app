"use client";
import { useState } from "react";
import { TextField, Button, Box, Typography, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ログイン試行:", { email, password });
    // ここに認証ロジック（Firebase, Auth.js, 自作APIなど）を記述します
  };

  return (
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-4 bg-white p-8 rounded-2xl shadow-md border border-gray-200"
      >
      <div className="flex flex-col items-center mb-4">
        <div className="bg-blue-500 p-3 rounded-full mb-2 shadow-blue-200 shadow-lg">
          <LockOutlined sx={{ color: 'white' }} />
        </div>
        <Typography variant="h5" fontWeight="800" color="black">Welcome Back</Typography>
        <Typography variant="body2" color="textSecondary">お天気チェッカーにログイン</Typography>
      </div>

      <TextField
        label="メールアドレス"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
      />

      <TextField
        label="パスワード"
        variant="outlined"
        fullWidth
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        sx={{ 
          mt: 2, 
          py: 1.5, 
          borderRadius: "12px", 
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "1rem"
        }}
      >
        ログイン
      </Button>

      <Typography variant="body2" color="textSecondary" className="text-center mt-4">
        アカウントをお持ちでないですか？ 
        <span className="text-blue-600 font-bold cursor-pointer ml-1 hover:underline">
          新規登録
        </span>
      </Typography>
    </Box>
  );
}