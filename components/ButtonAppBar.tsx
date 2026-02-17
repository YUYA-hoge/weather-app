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
import { redirect } from "next/navigation";

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
          
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              cursor: user ? 'pointer' : 'default' // リンクの時はカーソルを指にする
            }}
            onClick={() => {
              if (user) redirect('/home');
            }}
          >
            {user ? "お天気チェッカー" : "ログイン画面"}
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {/* ユーザー名とメールアドレス：スマホでは非表示 */}
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
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
                sx={{ width: 32, height: 32, border: '1px solid white', cursor: 'pointer' }}
                onClick={() => redirect("/mypage")}
              />

              {/* ログアウトボタン */}
              <Button
                color="inherit"
                variant="outlined"
                size="small"
                onClick={() => signOut({ callbackUrl: "/" })}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { borderColor: 'white' },
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  whiteSpace: 'nowrap',
                }}
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