# 詳細設計書

| 項目 | 内容 |
|------|------|
| システム名 | お天気チェッカー（Weather App） |
| バージョン | 1.0 |
| 作成日 | 2026-02-17 |

---

## 1. 認証設計

### 1.1 auth.ts（認証設定）

**ファイルパス:** `/auth.ts`

```typescript
// Auth.jsの設定エントリーポイント
// handlers, signIn, signOut, auth の4つをエクスポートする
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google({ clientId, clientSecret })]
})
```

**設計のポイント:**
- プロジェクトルートの`auth.ts`を単一のソースオブトゥルース（Single Source of Truth）とする
- `handlers`：APIルートで使用（GET/POSTハンドラ）
- `signIn`：サーバーコンポーネント・Server Actionで使用
- `signOut`：同上（クライアントでは`next-auth/react`の`signOut`を使用）
- `auth()`：セッション取得のためサーバーコンポーネントから呼び出す

### 1.2 middleware.ts（認証ミドルウェア）

**ファイルパス:** `/middleware.ts`

```typescript
export default auth  // Auth.jsのデフォルトmiddlewareを使用

export const config = {
  matcher: ["/home/:path*"],  // /home 配下のみ認証チェック
}
```

**フロー:**
```
リクエスト → Middleware → セッション確認
                            ├── 有効 → リクエスト続行
                            └── 無効 → / へリダイレクト
```

### 1.3 Google OAuthコールバック設定

| 環境 | コールバックURL |
|------|---------------|
| 開発 | `http://localhost:3000/api/auth/callback/google` |
| 本番 | `https://<NEXT_PUBLIC_SITE_URL>/api/auth/callback/google` |

---

## 2. ページ詳細設計

### 2.1 ログインページ（`/`）

**ファイルパス:** `app/page.tsx`
**レンダリング:** Server Component（SSR）

**処理フロー:**
```
1. auth() でセッション取得
2. セッションあり → redirect("/home")
3. セッションなし → ログインページを表示
```

**表示要素:**
- `ButtonAppBar`（user未設定状態：「ログイン画面」表示）
- `Title`（"ログイン"）
- 説明テキスト
- `SignIn`コンポーネント（Googleログインボタン）

### 2.2 ホームページ（`/home`）

**ファイルパス:** `app/home/page.tsx`
**レンダリング:** Server Component（SSR）＋クライアントコンポーネント

**処理フロー:**
```
1. auth() でセッション取得
2. セッションなし → redirect("/")
3. getCities() でSupabaseから都市リスト取得（1時間キャッシュ）
4. ButtonAppBar（ユーザー情報あり）を表示
5. WeatherSection（initialCities渡し）をCSRで描画
```

**getCities関数:**
```typescript
async function getCities() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/city`, { next: { revalidate: 3600 } })
  return res.ok ? res.json() : []  // 失敗時は空配列を返す（フォールバック）
}
```

### 2.3 マイページ（`/mypage`）

**ファイルパス:** `app/mypage/page.tsx`
**レンダリング:** Server Component（SSR）

**処理フロー:**
```
1. auth() でセッション取得
2. セッションなし → redirect("/")
3. ButtonAppBar + Title("マイページ") を表示
```

**現状:** プレースホルダー実装。将来的にユーザー設定・お気に入り都市の表示を予定。

---

## 3. コンポーネント詳細設計

### 3.1 ButtonAppBar

**ファイルパス:** `components/ButtonAppBar.tsx`
**種別:** Client Component（`"use client"`）

**Props:**
```typescript
interface ButtonAppBarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}
```

**表示の分岐:**

| 条件 | 表示内容 |
|------|---------|
| `user`なし（ログインページ） | タイトル「ログイン画面」のみ |
| `user`あり（PC/タブレット） | タイトル + ユーザー名 + メール + アバター + ログアウトボタン |
| `user`あり（スマホ） | タイトル + アバター + ログアウトボタン（名前・メールは非表示） |

**レスポンシブ制御（MUI `sx`）:**
```typescript
// ユーザー名・メールエリア
display: { xs: 'none', sm: 'flex' }  // スマホで非表示

// ログアウトボタン
fontSize: { xs: '0.7rem', sm: '0.875rem' }
px: { xs: 1, sm: 2 }
```

**クリックイベント:**
- アプリ名クリック → `redirect('/home')`（ログイン時のみ）
- アバタークリック → `redirect('/mypage')`
- ログアウトボタン → `signOut({ callbackUrl: "/" })`（next-auth/react）

### 3.2 WeatherSection

**ファイルパス:** `components/WeatherSection.tsx`
**種別:** Client Component（`"use client"`）

**Props:**
```typescript
{ initialCities: City[] }
```

**状態管理（useState）:**

| state | 型 | 初期値 | 説明 |
|-------|-----|--------|------|
| `selectedCityObj` | `City \| null` | `null` | オートコンプリートの選択値 |
| `weather` | `string` | `""` | 天気概況（表示文字列） |
| `temp` | `number \| null` | `null` | 気温（℃） |
| `currentCity` | `string` | `""` | 現在地検索時の地名 |
| `coords` | `{lat, lon} \| null` | `null` | GPS座標 |
| `aiComment` | `string` | `""` | AIのテキストコメント |
| `aiScores` | `AiScores \| null` | `null` | AI活動スコア |
| `aiLoading` | `boolean` | `false` | AIロード中フラグ |
| `aiError` | `boolean` | `false` | AIエラーフラグ |

**主要ハンドラ:**

`handleSearch()` — 都市名検索
```
1. selectedCityObj?.name を取得（なければalert）
2. AIコメント系stateをリセット
3. /api/weather?city=xxx をfetch
4. data.error があれば weather にエラー文字列をセット
5. 正常時: weather/temp を更新、fetchAiComment() を非同期実行
```

`handleSearchToPosition()` — 現在地検索
```
1. navigator.geolocation.getCurrentPosition を呼び出し
2. selectedCityObj をリセット
3. AIコメント系stateをリセット
4. 取得した lat/lon で /api/weather/current?lat=&lon= をfetch
5. 正常時: weather/temp/currentCity を更新、fetchAiComment() を非同期実行
```

`fetchAiComment(weather, temp, city)` — AI生成
```
1. aiLoading=true, aiError=false, aiComment/aiScores をリセット
2. POST /api/ai-comment { weather, temp, city }
3. 成功時: aiComment/aiScores をセット
4. エラー時: aiError=true
5. finally: aiLoading=false
```

### 3.3 CityInput

**ファイルパス:** `components/CityInput.tsx`
**種別:** Client Component（`"use client"`）

**Props:**
```typescript
type Props = {
  label: string
  cities: City[]
  value: City | null        // 親から制御された選択値
  onChange: (city: City | null) => void  // 親への変更通知
}
```

**実装:** MUI Autocompleteを使用。`getOptionLabel`で「{jpName} ({name})」形式で表示。

### 3.4 AiCommentCard

**ファイルパス:** `components/AiCommentCard.tsx`
**種別:** 関数型コンポーネント（状態なし）

**型定義:**
```typescript
interface ActivityScore { score: number; label: string }
interface AiScores {
  outdoor: ActivityScore
  exercise: ActivityScore
  laundry: ActivityScore
  drive: ActivityScore
}
```

**表示ロジック:**

| 条件 | 表示 |
|------|------|
| `loading === true` | スピナー＋スケルトンUI |
| `error === true` | `null`（何も表示しない） |
| `!comment && !scores` | `null`（何も表示しない） |
| データあり | AIコメント＋活動スコア4件 |

**スコア表示:**
- 1〜5の数値を星（★☆）で表現
- スコア≥4：緑（`text-green-500`）
- スコア=3：黄（`text-yellow-500`）
- スコア≤2：赤（`text-red-400`）

**ACTIVITIES定義:**
```typescript
const ACTIVITIES = [
  { key: "outdoor",  emoji: "🌿", name: "外出" },
  { key: "exercise", emoji: "🏃", name: "運動" },
  { key: "laundry",  emoji: "👕", name: "洗濯" },
  { key: "drive",    emoji: "🚗", name: "ドライブ" },
]
```

### 3.5 sign-in.tsx

**ファイルパス:** `components/sign-in.tsx`
**種別:** Server Component（Server Action使用）

**処理:**
```typescript
// フォームのaction属性にServer Actionを指定
// "use server" ディレクティブ
await signIn("google", { redirectTo: "/home" })
```

---

## 4. 型定義

### 4.1 City型（都市データ）

```typescript
interface City {
  id: number       // Supabase主キー
  name: string     // 英語都市名（OpenWeatherMap用）例: "Tokyo"
  jpName: string   // 日本語都市名（表示用）例: "東京"
}
```

### 4.2 ActivityScore型（AIスコア）

```typescript
interface ActivityScore {
  score: number   // 1〜5の整数
  label: string   // 10文字以内の評価ラベル（例: "快適です"）
}
```

### 4.3 AiScores型（全活動スコア）

```typescript
interface AiScores {
  outdoor:  ActivityScore
  exercise: ActivityScore
  laundry:  ActivityScore
  drive:    ActivityScore
}
```

---

## 5. ルーティング設計

| パス | 種別 | 保護 | 説明 |
|------|------|------|------|
| `/` | Page | なし | ログインページ |
| `/home` | Page | 認証必須 | 天気検索メインページ |
| `/mypage` | Page | 認証必須 | マイページ |
| `/api/auth/[...nextauth]` | API | なし | Auth.jsハンドラ |
| `/api/city` | API | なし | 都市リスト取得 |
| `/api/weather` | API | なし | 都市名で天気取得 |
| `/api/weather/current` | API | なし | GPS座標で天気取得 |
| `/api/ai-comment` | API | なし | AIコメント生成 |

**注意:** APIルートはミドルウェアの保護対象外。ただし、APIキーが環境変数に設定されていない場合は500エラーを返す。
