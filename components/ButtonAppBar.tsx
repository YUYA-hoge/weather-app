"use client"

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button'; // サインアウトボタン用に追加
import { signOut } from "next-auth/react"; // クライアント側でサインアウトを実行

interface ButtonAppBarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ButtonAppBar({ user }: ButtonAppBarProps) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {user ? "お天気チェッカー" : "ログイン画面"}
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* ユーザー名とメールアドレス */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography variant="body2" sx={{ lineHeight: 1, fontWeight: 'bold' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {user.email}
                </Typography>
              </Box>

              {/* アバター */}
              <Avatar 
                alt={user.name || ""} 
                src={user.image || ""} 
                sx={{ width: 32, height: 32, border: '1px solid white' }}
              />

              {/* ログアウトボタン */}
              <Button 
                color="inherit" 
                variant="outlined" 
                size="small"
                onClick={() => signOut({ callbackUrl: "/" })}
                sx={{ ml: 1, borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white' } }}
              >
                ログアウト
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}