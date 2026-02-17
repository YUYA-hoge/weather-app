# 環境構築手順書

| 項目 | 内容 |
|------|------|
| システム名 | お天気チェッカー（Weather App） |
| バージョン | 1.0 |
| 作成日 | 2026-02-17 |

---

## 1. 必要な外部サービス・アカウント

本アプリケーションを動作させるには以下のサービスへの登録が必要です。

| サービス | 用途 | URL |
|---------|------|-----|
| Google Cloud Console | OAuth 2.0クライアントの発行・Gemini APIキーの取得 | https://console.cloud.google.com |
| OpenWeatherMap | 天気データ取得APIキーの取得 | https://openweathermap.org |
| Supabase | 都市データを管理するDBのURL・キーの取得 | https://supabase.com |

---

## 2. 前提条件（開発環境）

| ツール | 推奨バージョン | 確認コマンド |
|--------|-------------|-------------|
| Node.js | 18.x 以上（LTS） | `node -v` |
| npm | 9.x 以上 | `npm -v` |
| Git | 最新版 | `git --version` |

---

## 3. 開発環境構築手順

### 3.1 リポジトリのクローン

```bash
git clone <リポジトリURL>
cd weather-app
```

### 3.2 依存パッケージのインストール

```bash
npm install
```

### 3.3 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下を設定する。

```bash
# .env.local

# OpenWeatherMap APIキー
# https://home.openweathermap.org/api_keys から取得
APIKEY=your_openweathermap_api_key

# Supabase設定
# Supabaseダッシュボード → Project Settings → API から取得
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJ...

# Google OAuth設定
# Google Cloud Console → 認証情報 → OAuth 2.0クライアントID から取得
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx

# NextAuth設定
# 以下のコマンドで生成: npx auth secret
AUTH_SECRET=your_generated_secret_here

# サイトURL（開発時は http://localhost:3000）
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Gemini APIキー
# Google Cloud Console → APIs & Services → Gemini API から取得
GEMINI_API_KEY=AIzaSy...
```

> **.env.local は絶対に Git にコミットしないこと（.gitignore で除外済み）**

### 3.4 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスして動作を確認する。

---

## 4. 各外部サービスの設定手順

### 4.1 Google Cloud Console（OAuth + Gemini）

#### OAuth 2.0の設定

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新規プロジェクトを作成（または既存プロジェクトを選択）
3. 「APIとサービス」→「OAuth同意画面」を設定
   - ユーザーの種類：外部
   - アプリ名・サポートメールを入力
   - スコープに `email`, `profile`, `openid` を追加
4. 「認証情報」→「認証情報を作成」→「OAuthクライアントID」を選択
5. アプリケーションの種類：ウェブアプリケーション
6. 承認済みのリダイレクトURIを追加：
   - 開発: `http://localhost:3000/api/auth/callback/google`
   - 本番: `https://<本番ドメイン>/api/auth/callback/google`
7. クライアントIDとクライアントシークレットを`.env.local`に設定

#### Gemini APIの設定

1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」
2. 「Generative Language API」を検索して有効化
3. 「認証情報」→「APIキーを作成」
4. 取得したAPIキーを `GEMINI_API_KEY` に設定

### 4.2 OpenWeatherMap APIキーの取得

1. [OpenWeatherMap](https://home.openweathermap.org) でアカウント作成
2. ログイン後「My API Keys」からAPIキーを確認・作成
3. 取得したキーを `APIKEY` に設定
4. 新規作成直後はAPIが有効化されるまで数時間かかる場合がある

### 4.3 Supabaseの設定

#### プロジェクト作成

1. [Supabase](https://supabase.com) でアカウント作成
2. 「New Project」でプロジェクトを作成
3. 「Project Settings」→「API」から以下を取得：
   - `Project URL` → `SUPABASE_URL`
   - `anon public` キー → `SUPABASE_ANON_KEY`

#### テーブル作成

Supabase SQLエディタで以下を実行：

```sql
-- citiesテーブルの作成
CREATE TABLE cities (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  "jpName" TEXT NOT NULL
);

-- Row Level Security の設定（SELECT許可）
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON cities
  FOR SELECT
  USING (true);
```

#### 初期データの挿入

```sql
INSERT INTO cities (name, "jpName") VALUES
  ('Tokyo', '東京'),
  ('Osaka', '大阪'),
  ('Nagoya', '名古屋'),
  ('Sapporo', '札幌'),
  ('Fukuoka', '福岡'),
  ('Sendai', '仙台'),
  ('Kyoto', '京都'),
  ('Yokohama', '横浜'),
  ('Kobe', '神戸'),
  ('Hiroshima', '広島'),
  ('Naha', '那覇'),
  ('Kanazawa', '金沢'),
  ('Matsuyama', '松山'),
  ('Nagasaki', '長崎'),
  ('Kumamoto', '熊本');
```

### 4.4 AUTH_SECRETの生成

```bash
npx auth secret
```

生成されたシークレットを `.env.local` の `AUTH_SECRET` に設定。

---

## 5. 動作確認チェックリスト

### 5.1 開発環境

- [ ] `npm run dev` でサーバーが起動する
- [ ] `http://localhost:3000` でログイン画面が表示される
- [ ] Googleログインが完了して `/home` にリダイレクトされる
- [ ] 都市を選択して「検索」ボタンで天気が表示される
- [ ] 「現在地から検索」ボタンで現在地の天気が取得される
- [ ] AI分析のスピナーが表示され、結果が表示される
- [ ] ログアウトでログイン画面に戻る
- [ ] `npm run lint` でエラーがない

---

## 6. 本番環境へのデプロイ（Vercel推奨）

### 6.1 Vercelへのデプロイ手順

1. [Vercel](https://vercel.com) でアカウント作成
2. GitHubリポジトリをインポート
3. 「Environment Variables」に以下を設定：

| 変数名 | 値 |
|--------|-----|
| `APIKEY` | OpenWeatherMap APIキー |
| `SUPABASE_URL` | SupabaseプロジェクトURL |
| `SUPABASE_ANON_KEY` | Supabase Anonキー |
| `GOOGLE_CLIENT_ID` | Google OAuthクライアントID |
| `GOOGLE_CLIENT_SECRET` | Google OAuthクライアントシークレット |
| `AUTH_SECRET` | NextAuth シークレット（本番用に再生成推奨） |
| `NEXT_PUBLIC_SITE_URL` | 本番URL（例: `https://your-app.vercel.app`） |
| `GEMINI_API_KEY` | Gemini APIキー |

4. デプロイ後、Google Cloud ConsoleのOAuthリダイレクトURIに本番URLを追加：
   `https://your-app.vercel.app/api/auth/callback/google`

### 6.2 デプロイ確認コマンド

```bash
# ローカルでビルドを確認
npm run build

# ビルド成功後、本番ビルドを起動して確認
npm run start
```

---

## 7. トラブルシューティング（環境構築時）

| 症状 | 原因 | 解決策 |
|------|------|--------|
| Googleログインで「redirect_uri_mismatch」エラー | コールバックURIが未登録 | Google Cloud ConsoleにリダイレクトURIを追加 |
| 都市リストが空 | Supabase接続失敗 | `SUPABASE_URL`・`SUPABASE_ANON_KEY`を確認。RLSポリシーを確認 |
| 天気が取得できない | OpenWeatherMap APIキーが無効 | キーが有効化されているか確認（新規作成から数時間待つ） |
| AI分析が動かない | Gemini APIキーが未設定 | `GEMINI_API_KEY`を設定し、APIが有効化されているか確認 |
| ログインページが表示されない | `AUTH_SECRET`が未設定 | `npx auth secret`で生成して設定 |
| ビルドエラー | TypeScriptの型エラー | `npm run lint`でエラー箇所を確認して修正 |
