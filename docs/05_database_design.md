# データベース設計書

| 項目 | 内容 |
|------|------|
| システム名 | お天気チェッカー（Weather App） |
| バージョン | 1.0 |
| 作成日 | 2026-02-17 |

---

## 1. データベース概要

| 項目 | 内容 |
|------|------|
| DBサービス | Supabase（クラウドマネージドPostgreSQL） |
| PostgreSQLバージョン | Supabaseデフォルト（15系） |
| アクセス方式 | REST API（PostgREST）/ Supabase Client SDK |
| 現在のテーブル数 | 1（`cities`テーブルのみ） |

---

## 2. テーブル設計

### 2.1 cities（都市マスタ）

**用途:** 天気検索で使用できる都市の一覧を管理するマスタテーブル。

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| `id` | integer | NOT NULL | SERIAL | 主キー（自動採番） |
| `name` | text | NOT NULL | - | 英語都市名（OpenWeatherMap API用） |
| `jpName` | text | NOT NULL | - | 日本語都市名（UI表示用） |

**サンプルデータ:**

| id | name | jpName |
|----|------|--------|
| 1 | Tokyo | 東京 |
| 2 | Osaka | 大阪 |
| 3 | Nagoya | 名古屋 |
| 4 | Sapporo | 札幌 |
| 5 | Fukuoka | 福岡 |
| 6 | Sendai | 仙台 |
| 7 | Kyoto | 京都 |
| 8 | Yokohama | 横浜 |
| 9 | Kobe | 神戸 |
| 10 | Hiroshima | 広島 |

**DDL（テーブル作成SQL）:**

```sql
CREATE TABLE cities (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  "jpName" TEXT NOT NULL
);
```

**インデックス:**

```sql
-- nameカラムは検索・ソートに使用される可能性があるため追加推奨
CREATE INDEX idx_cities_name ON cities(name);
```

**Row Level Security（RLS）設定:**

```sql
-- Anonキーでの読み取りを許可（SELECT Only）
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "誰でも読み取り可能" ON cities
  FOR SELECT
  USING (true);
```

---

## 3. データアクセスパターン

### 3.1 都市リスト取得（全件）

**実行タイミング:** `/home` ページ初期表示時（SSR）

**REST APIリクエスト:**
```
GET {SUPABASE_URL}/rest/v1/cities?select=*
Headers:
  apikey: {SUPABASE_ANON_KEY}
  Authorization: Bearer {SUPABASE_ANON_KEY}
```

**取得内容:** `id`, `name`, `jpName` の全レコード（全件取得）

**キャッシュ:** Next.js fetch cache（1時間 revalidate）

---

## 4. 将来的なテーブル設計案

現バージョンでは`cities`テーブルのみだが、機能拡張に備えた設計案を示す。

### 4.1 user_favorites（お気に入り都市）

```sql
CREATE TABLE user_favorites (
  id         SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,           -- Google認証のメールアドレス
  city_id    INTEGER NOT NULL REFERENCES cities(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, city_id)
);
```

### 4.2 weather_history（天気検索履歴）

```sql
CREATE TABLE weather_history (
  id         SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  city_name  TEXT NOT NULL,
  weather    TEXT NOT NULL,
  temp       NUMERIC(5,2) NOT NULL,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. 環境変数（DB接続設定）

| 環境変数名 | 説明 | 設定例 |
|-----------|------|-------|
| `SUPABASE_URL` | SupabaseプロジェクトのURL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anonキー（公開可能） | `eyJhbGciOiJ...` |

> **注意:** `SUPABASE_ANON_KEY`はRLSが有効な場合のみAnonymousアクセス許可の範囲で動作する。管理者権限を要する操作には`SUPABASE_SERVICE_KEY`（絶対にクライアントに渡してはならない）を使用すること。

---

## 6. バックアップ・データ管理

| 項目 | 内容 |
|------|------|
| バックアップ | Supabaseが自動でポイントインタイムリカバリを提供（Proプラン） |
| マスタデータ更新 | Supabase管理コンソールから手動でINSERT/UPDATE |
| データ量 | cities テーブルは数十〜数百件程度の静的マスタデータ |
