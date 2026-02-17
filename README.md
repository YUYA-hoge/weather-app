# お天気チェッカー（Weather App）

Google認証でログインして、都市名または現在地から天気を確認できるWebアプリケーションです。
AI（Google Gemini）による活動アドバイスと、外出・運動・洗濯・ドライブの4項目スコアを表示します。

---

## 機能一覧

- **Googleログイン** — Google OAuthによる認証
- **都市名で天気検索** — プルダウンから都市を選んで天気・気温を表示
- **現在地で天気検索** — GPSから自動取得して天気・気温を表示
- **AI分析** — Gemini 2.5 Flashによる天気コメント・活動スコア（外出・運動・洗濯・ドライブ）
- **レスポンシブ対応** — スマートフォン・タブレット・PCに対応

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16（App Router） |
| 言語 | TypeScript |
| UIライブラリ | React 19 / MUI v7 / Tailwind CSS v4 |
| 認証 | Auth.js v5（next-auth@beta） / Google OAuth 2.0 |
| 天気データ | OpenWeatherMap API |
| AI | Google Gemini 2.5 Flash |
| データベース | Supabase（PostgreSQL） |

---

## 環境変数

プロジェクトルートに `.env.local` を作成し、以下を設定してください。

```bash
APIKEY=                  # OpenWeatherMap APIキー
SUPABASE_URL=            # SupabaseプロジェクトURL
SUPABASE_ANON_KEY=       # Supabase Anonキー
GOOGLE_CLIENT_ID=        # Google OAuthクライアントID
GOOGLE_CLIENT_SECRET=    # Google OAuthクライアントシークレット
AUTH_SECRET=             # NextAuth用シークレット（npx auth secret で生成）
NEXT_PUBLIC_SITE_URL=    # サイトURL（例: http://localhost:3000）
GEMINI_API_KEY=          # Google Gemini APIキー
```

---

## セットアップ・起動方法

```bash
# 1. 依存パッケージのインストール
npm install

# 2. .env.local を作成して環境変数を設定

# 3. 開発サーバーの起動
npm run dev
```

`http://localhost:3000` にアクセスして動作を確認してください。

---

## 主なコマンド

```bash
npm run dev    # 開発サーバー起動（http://localhost:3000）
npm run build  # 本番ビルド
npm run start  # 本番サーバー起動
npm run lint   # ESLintによる静的解析
```

---

## ページ構成

| URL | 内容 | 認証 |
|-----|------|------|
| `/` | ログインページ | 不要 |
| `/home` | 天気検索メインページ | 必須 |
| `/mypage` | マイページ | 必須 |

---

## ドキュメント

詳細なシステムドキュメントは [`docs/`](./docs/) フォルダを参照してください。

| ドキュメント | 内容 |
|------------|------|
| [要件定義書](./docs/01_requirements.md) | 機能要件・非機能要件 |
| [基本設計書](./docs/02_basic_design.md) | システム構成・アーキテクチャ |
| [詳細設計書](./docs/03_detailed_design.md) | コンポーネント・処理フロー |
| [API設計書](./docs/04_api_design.md) | エンドポイント仕様 |
| [DB設計書](./docs/05_database_design.md) | テーブル定義 |
| [画面設計書](./docs/06_screen_design.md) | 画面レイアウト・遷移図 |
| [環境構築手順書](./docs/07_environment_setup.md) | セットアップ詳細手順 |
| [セキュリティ設計書](./docs/08_security_design.md) | 認証・APIキー管理 |
| [テスト計画書](./docs/09_test_plan.md) | テストケース一覧 |
| [運用保守設計書](./docs/10_operations.md) | デプロイ・障害対応 |

---

## デプロイ（Vercel推奨）

1. [Vercel](https://vercel.com) にGitHubリポジトリをインポート
2. 環境変数を設定（上記の `.env.local` と同じ内容）
3. Google Cloud ConsoleのOAuthリダイレクトURIに本番URLを追加
   - `https://<your-domain>/api/auth/callback/google`
