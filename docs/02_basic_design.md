# 基本設計書（システム方式設計書）

| 項目 | 内容 |
|------|------|
| システム名 | お天気チェッカー（Weather App） |
| バージョン | 1.0 |
| 作成日 | 2026-02-17 |

---

## 1. システム全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                        クライアント (ブラウザ)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js App（React 19）                               │ │
│  │  ・Tailwind CSS v4 + MUI v7                           │ │
│  │  ・認証状態管理（next-auth/react）                      │ │
│  └─────────────────────┬──────────────────────────────────┘ │
└────────────────────────│────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                  Next.js サーバー (App Router)               │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  ページ(SSR) │  │   Middleware │  │   API Routes     │  │
│  │  /           │  │  認証チェック │  │  /api/weather    │  │
│  │  /home       │  │  /home/*    │  │  /api/city       │  │
│  │  /mypage     │  └──────────────┘  │  /api/ai-comment │  │
│  └──────────────┘                    │  /api/auth/*     │  │
│                                      └──────────────────┘  │
└────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────────┐
         │               │               │                  │
         ▼               ▼               ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ OpenWeather  │ │   Supabase   │ │  Google      │ │  Google      │
│ Map API      │ │  (PostgreSQL)│ │  Gemini API  │ │  OAuth       │
│ 天気情報取得 │ │  都市リスト  │ │  AIコメント  │ │  ユーザー認証│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 2. 技術スタック

### 2.1 フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.1.6 | フレームワーク（App Router） |
| React | 19.2.3 | UIライブラリ |
| TypeScript | ^5 | 型安全なコーディング |
| Tailwind CSS | ^4 | ユーティリティファーストCSS |
| MUI (Material UI) | ^7 | UIコンポーネントライブラリ |
| @emotion/react | ^11 | MUIのスタイルエンジン |

### 2.2 バックエンド（Next.js API Routes）

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js API Routes | 16.1.6 | サーバーサイドAPI処理 |
| Auth.js (next-auth) | ^5.0.0-beta.30 | 認証フレームワーク |

### 2.3 外部サービス・API

| サービス | 用途 | 通信方向 |
|---------|------|---------|
| OpenWeatherMap API | 天気データ取得 | サーバー → 外部API |
| Google Gemini API | AIコメント・スコア生成 | サーバー → 外部API |
| Supabase (PostgreSQL) | 都市マスタデータ管理 | サーバー → 外部DB |
| Google OAuth 2.0 | ユーザー認証 | サーバー ↔ 外部サービス |

### 2.4 開発ツール

| ツール | 用途 |
|--------|------|
| ESLint | コード品質チェック |
| TypeScript Compiler | 型チェック |
| PostCSS | CSSビルド（Tailwind用） |

---

## 3. アプリケーション方式

### 3.1 レンダリング方式

| ページ | 方式 | 理由 |
|--------|------|------|
| `/` (ログイン) | SSR（Server-Side Rendering） | セッション確認後のリダイレクト処理が必要 |
| `/home` | SSR | 認証チェック＋都市リストの初期データ取得 |
| `/mypage` | SSR | 認証チェック＋ユーザー情報の取得 |
| 天気・AI表示部分 | CSR（Client-Side Rendering） | ユーザー操作に応じた動的データ取得 |

### 3.2 認証方式

```
ユーザー → [ログインボタン] → Google OAuth → コールバック
                                                  │
                                    Auth.js が JWT/セッション発行
                                                  │
                                    /home へリダイレクト
```

- **Auth.js v5（next-auth@beta）** を使用
- Middlewareで `/home` 配下を一括保護
- サーバーコンポーネントでは `auth()` を直接呼び出し
- クライアントコンポーネントでは `next-auth/react` の `signOut` を使用

### 3.3 データフロー

**天気検索（都市名）:**
```
CityInput [選択] → WeatherSection.handleSearch()
    → fetch("/api/weather?city=xxx")
    → Next.js API Route
    → OpenWeatherMap API
    → { weather, temp, name } 返却
    → 画面表示 + fetchAiComment() 並行実行
```

**天気検索（現在地）:**
```
[現在地から検索] → navigator.geolocation.getCurrentPosition()
    → fetch("/api/weather/current?lat=xx&lon=yy")
    → Next.js API Route
    → OpenWeatherMap API
    → { weather, temp, name } 返却
    → 画面表示 + fetchAiComment() 並行実行
```

**AI分析:**
```
fetchAiComment(weather, temp, city)
    → fetch("/api/ai-comment", POST)
    → Next.js API Route
    → Google Gemini API
    → { comment, scores } 返却
    → AiCommentCard に表示
```

---

## 4. ディレクトリ構成

```
weather-app/
├── app/                          # Next.js App Router
│   ├── api/                      # APIルート（サーバーサイド）
│   │   ├── ai-comment/
│   │   │   └── route.ts          # POST: AIコメント生成
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # GET/POST: 認証ハンドラ
│   │   ├── city/
│   │   │   └── route.ts          # GET: 都市リスト取得
│   │   └── weather/
│   │       ├── route.ts          # GET: 都市名で天気取得
│   │       └── current/
│   │           └── route.ts      # GET: GPS座標で天気取得
│   ├── home/
│   │   └── page.tsx              # メイン天気ページ（保護）
│   ├── mypage/
│   │   └── page.tsx              # マイページ（保護）
│   ├── globals.css               # グローバルCSS
│   ├── layout.tsx                # ルートレイアウト
│   └── page.tsx                  # ログインページ
│
├── components/                   # 共有UIコンポーネント
│   ├── AiCommentCard.tsx         # AIコメント・スコア表示
│   ├── Button.tsx                # MUIボタンラッパー
│   ├── ButtonAppBar.tsx          # ヘッダーナビゲーション
│   ├── CityInput.tsx             # 都市選択オートコンプリート
│   ├── Title.tsx                 # ページタイトル
│   ├── WeatherSection.tsx        # 天気検索・表示メイン
│   ├── sign-in.tsx               # Googleサインインボタン
│   └── index.tsx                 # 一括エクスポート
│
├── docs/                         # システムドキュメント（本書）
├── auth.ts                       # Auth.js設定（シングルソース）
├── middleware.ts                 # 認証ミドルウェア
├── next.config.ts                # Next.js設定
├── tsconfig.json                 # TypeScript設定
├── eslint.config.mjs             # ESLint設定
├── postcss.config.mjs            # PostCSS設定
└── .env.local                    # 環境変数（Gitに含まない）
```

---

## 5. コンポーネント設計方針

### 5.1 サーバーコンポーネント vs クライアントコンポーネント

| コンポーネント | 種別 | 理由 |
|----------------|------|------|
| `app/page.tsx` | Server | 認証チェック・リダイレクト |
| `app/home/page.tsx` | Server | 認証チェック・都市リスト取得 |
| `app/mypage/page.tsx` | Server | 認証チェック |
| `ButtonAppBar.tsx` | Client | `signOut`（next-auth/react）使用 |
| `WeatherSection.tsx` | Client | `useState`・fetch処理 |
| `CityInput.tsx` | Client | MUI Autocompleteのイベント処理 |
| `AiCommentCard.tsx` | Server（関数型） | 状態なし・表示のみ |
| `sign-in.tsx` | Server | Server Action（"use server"）使用 |
| `Title.tsx` | Server | 状態なし・表示のみ |
| `Button.tsx` | Server | propsのみ、状態なし |

### 5.2 Props インターフェース設計

- 各コンポーネントはTypeScriptのinterfaceまたはtypeで明示的に型定義する
- `WeatherSection`は`initialCities`をサーバーから受け取り、以降の状態はクライアントで管理する

---

## 6. エラーハンドリング方針

| レイヤー | 対応方法 |
|---------|---------|
| APIルート（天気） | `response.ok`チェック、エラー時は`{ error: "..." }`を返却 |
| APIルート（AI） | try-catchで囲み、エラー時は500ステータスで返却 |
| クライアント（天気） | `data.error`の存在確認、天気表示欄にエラーメッセージ表示 |
| クライアント（AI） | `aiError`フラグで管理、エラー時はAIカード非表示 |
| 環境変数不足 | APIキー未設定時は500エラーを返却し処理を中断 |

---

## 7. キャッシュ戦略

| データ | キャッシュ方式 | TTL | 説明 |
|--------|--------------|-----|------|
| 都市リスト | Next.js fetch cache | 3600秒（1時間） | `{ next: { revalidate: 3600 } }` |
| 天気データ | なし（毎回取得） | - | ユーザー操作ごとにリアルタイム取得 |
| AIコメント | なし | - | 天気検索のたびに再生成 |
| 認証セッション | Auth.jsのデフォルト | セッション期限まで | JWTまたはDBセッション |
