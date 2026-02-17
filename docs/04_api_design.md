# API設計書

| 項目 | 内容 |
|------|------|
| システム名 | お天気チェッカー（Weather App） |
| バージョン | 1.0 |
| 作成日 | 2026-02-17 |

---

## 1. APIエンドポイント一覧

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|------|
| GET | `/api/weather` | 都市名で天気を取得 | 不要 |
| GET | `/api/weather/current` | GPS座標で天気を取得 | 不要 |
| GET | `/api/city` | 都市リストを取得 | 不要 |
| POST | `/api/ai-comment` | AIコメント・スコアを生成 | 不要 |
| GET | `/api/auth/[...nextauth]` | Auth.js認証ハンドラ | - |
| POST | `/api/auth/[...nextauth]` | Auth.js認証ハンドラ | - |

> **注意:** 内部APIのため現バージョンではAPIキー認証は実装していないが、本番環境では認証の追加を検討すること。

---

## 2. 天気取得API（都市名）

### エンドポイント
`GET /api/weather`

### ファイルパス
`app/api/weather/route.ts`

### リクエスト

| パラメータ | 種別 | 型 | 必須 | 説明 |
|-----------|------|-----|------|------|
| `city` | クエリ | string | 必須 | 英語の都市名（例: `Tokyo`） |

**リクエスト例:**
```
GET /api/weather?city=Tokyo
```

### レスポンス

**成功（200 OK）:**
```json
{
  "name": "Tokyo",
  "weather": "晴れ",
  "temp": 18.5
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `name` | string | OpenWeatherMapが返す地名 |
| `weather` | string | 天気概況（日本語、lang=ja） |
| `temp` | number | 現在気温（℃、units=metric） |

**エラー（400 Bad Request）:**
```json
{ "error": "都市名が必要です" }
```

**エラー（404 Not Found等）:**
```json
{ "error": "city not found" }
```

**エラー（500 Internal Server Error）:**
```json
{ "error": "サーバーエラーが発生しました" }
```

### 外部API呼び出し

```
https://api.openweathermap.org/data/2.5/weather
  ?q={city}
  &appid={APIKEY}
  &lang=ja
  &units=metric
```

---

## 3. 天気取得API（現在地）

### エンドポイント
`GET /api/weather/current`

### ファイルパス
`app/api/weather/current/route.ts`

### リクエスト

| パラメータ | 種別 | 型 | 必須 | 説明 |
|-----------|------|-----|------|------|
| `lat` | クエリ | string（数値） | 必須 | 緯度（例: `35.68`） |
| `lon` | クエリ | string（数値） | 必須 | 経度（例: `139.69`） |

**リクエスト例:**
```
GET /api/weather/current?lat=35.68&lon=139.69
```

### レスポンス

**成功（200 OK）:**
```json
{
  "name": "Tokyo",
  "weather": "曇り",
  "temp": 15.2
}
```

**エラー（400 Bad Request）:**
```json
{ "error": "位置情報が必要です" }
```

**エラー（500 Internal Server Error）:**
```json
{ "error": "サーバーエラーが発生しました" }
```

### 外部API呼び出し

```
https://api.openweathermap.org/data/2.5/weather
  ?lat={lat}
  &lon={lon}
  &appid={APIKEY}
  &units=metric
  &lang=ja
```

---

## 4. 都市リストAPI

### エンドポイント
`GET /api/city`

### ファイルパス
`app/api/city/route.ts`

### リクエスト

クエリパラメータなし。

**リクエスト例:**
```
GET /api/city
```

### レスポンス

**成功（200 OK）:**
```json
[
  { "id": 1, "name": "Tokyo", "jpName": "東京" },
  { "id": 2, "name": "Osaka", "jpName": "大阪" },
  { "id": 3, "name": "Sapporo", "jpName": "札幌" }
]
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | number | Supabase主キー |
| `name` | string | 英語都市名（OpenWeatherMap用） |
| `jpName` | string | 日本語都市名（UI表示用） |

**エラー（500 Internal Server Error）:**
```json
{ "error": "サーバーエラーが発生しました" }
```

### Supabase呼び出し

```
GET {SUPABASE_URL}/rest/v1/cities?select=*
Headers:
  apikey: {SUPABASE_ANON_KEY}
  Authorization: Bearer {SUPABASE_ANON_KEY}
```

### キャッシュ

呼び出し元（`app/home/page.tsx`）で1時間のRevalidateキャッシュを設定:
```typescript
fetch(`${baseUrl}/api/city`, { next: { revalidate: 3600 } })
```

---

## 5. AIコメントAPI

### エンドポイント
`POST /api/ai-comment`

### ファイルパス
`app/api/ai-comment/route.ts`

### リクエスト

**Content-Type:** `application/json`

**リクエストボディ:**
```json
{
  "weather": "晴れ",
  "temp": 22,
  "city": "Tokyo"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `weather` | string | 必須 | 天気概況文字列 |
| `temp` | number | 必須 | 気温（℃） |
| `city` | string | 任意 | 都市名（不明の場合は省略可） |

### レスポンス

**成功（200 OK）:**
```json
{
  "comment": "日差しが強く暑い一日になりそうです。帽子と日焼け止めをお忘れなく。水分補給も大切です。",
  "scores": {
    "outdoor":  { "score": 4, "label": "向いている" },
    "exercise": { "score": 3, "label": "普通" },
    "laundry":  { "score": 5, "label": "最適" },
    "drive":    { "score": 4, "label": "快適" }
  }
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `comment` | string | 2〜3文の日本語アドバイス |
| `scores.outdoor.score` | number（1〜5） | 外出適性スコア |
| `scores.outdoor.label` | string（10文字以内） | 外出評価ラベル |
| `scores.exercise.score` | number（1〜5） | 運動適性スコア |
| `scores.exercise.label` | string（10文字以内） | 運動評価ラベル |
| `scores.laundry.score` | number（1〜5） | 洗濯適性スコア |
| `scores.laundry.label` | string（10文字以内） | 洗濯評価ラベル |
| `scores.drive.score` | number（1〜5） | ドライブ適性スコア |
| `scores.drive.label` | string（10文字以内） | ドライブ評価ラベル |

**スコア基準:**
| スコア | 意味 |
|--------|------|
| 1 | 不向き |
| 2 | やや不向き |
| 3 | 普通 |
| 4 | 向いている |
| 5 | 最適 |

**エラー（400 Bad Request）:**
```json
{ "error": "weather と temp は必須です" }
```

**エラー（500 Internal Server Error）:**
```json
{ "error": "Gemini APIキーが設定されていません" }
```

```json
{ "error": "AI生成に失敗しました" }
```

### Gemini API呼び出し

- **モデル:** `gemini-2.5-flash`
- **出力形式:** `application/json`（`responseMimeType`で指定）
- **プロンプト形式:**

```
天気: {weather}、気温: {temp}℃、都市: {city}

以下のJSON形式で厳密に出力してください（余分なテキスト不要）:
{
  "comment": "服装・持ち物・活動のアドバイスを2〜3文の日本語で",
  "scores": {
    "outdoor":  { "score": スコア, "label": "10文字以内の評価" },
    "exercise": { "score": スコア, "label": "10文字以内の評価" },
    "laundry":  { "score": スコア, "label": "10文字以内の評価" },
    "drive":    { "score": スコア, "label": "10文字以内の評価" }
  }
}
スコア基準: 1=不向き, 2=やや不向き, 3=普通, 4=向いている, 5=最適
```

---

## 6. 認証APIハンドラ

### エンドポイント
`GET /api/auth/[...nextauth]`
`POST /api/auth/[...nextauth]`

### ファイルパス
`app/api/auth/[...nextauth]/route.ts`

### 説明

Auth.js（NextAuth v5）が内部的に使用するハンドラ。主なルートは以下の通り。

| パス | 説明 |
|------|------|
| `GET /api/auth/signin` | サインインページへのリダイレクト |
| `GET /api/auth/callback/google` | Google OAuthコールバック処理 |
| `GET /api/auth/signout` | サインアウト処理 |
| `GET /api/auth/session` | 現在のセッション情報を返す |

**実装:**
```typescript
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

---

## 7. 外部API利用制限・注意事項

### OpenWeatherMap API

| 項目 | 内容 |
|------|------|
| プラン | Free（現在）|
| レート制限 | 60回/分、1,000,000回/月 |
| レスポンス言語 | `lang=ja` で日本語対応 |
| 単位系 | `units=metric` で摂氏（℃）返却 |
| エラー時 | HTTP 4xx/5xxのステータスコードを返す |

### Google Gemini API

| 項目 | 内容 |
|------|------|
| モデル | `gemini-2.5-flash` |
| レスポンス形式 | `application/json`（構造化出力） |
| タイムアウト | APIデフォルト（数秒〜数十秒） |
| コスト | 従量課金（呼び出し回数に応じる） |

### Supabase

| 項目 | 内容 |
|------|------|
| 認証 | `apikey`・`Authorization`ヘッダー（Anonキー） |
| アクセス方法 | REST API（PostgREST） |
| Row Level Security | 要確認（Anonキーでの読み取りを許可する設定が必要） |
