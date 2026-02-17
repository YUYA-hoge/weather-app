# ドキュメント一覧

**システム名:** お天気チェッカー（Weather App）
**最終更新:** 2026-02-17

---

## ドキュメント構成

| No. | ファイル名 | ドキュメント名 | 概要 |
|-----|-----------|-------------|------|
| 01 | [01_requirements.md](./01_requirements.md) | 要件定義書 | 機能要件・非機能要件・制約条件 |
| 02 | [02_basic_design.md](./02_basic_design.md) | 基本設計書 | システム全体構成・技術スタック・アーキテクチャ |
| 03 | [03_detailed_design.md](./03_detailed_design.md) | 詳細設計書 | 各コンポーネント・ページの実装設計 |
| 04 | [04_api_design.md](./04_api_design.md) | API設計書 | エンドポイント・リクエスト・レスポンス仕様 |
| 05 | [05_database_design.md](./05_database_design.md) | データベース設計書 | テーブル定義・DDL・将来設計案 |
| 06 | [06_screen_design.md](./06_screen_design.md) | 画面設計書 | 画面一覧・遷移図・レイアウト・カラーパレット |
| 07 | [07_environment_setup.md](./07_environment_setup.md) | 環境構築手順書 | 開発環境・本番環境のセットアップ手順 |
| 08 | [08_security_design.md](./08_security_design.md) | セキュリティ設計書 | 認証・APIキー管理・脆弱性対策 |
| 09 | [09_test_plan.md](./09_test_plan.md) | テスト計画書 | テストケース一覧・自動テスト導入計画 |
| 10 | [10_operations.md](./10_operations.md) | 運用保守設計書 | デプロイ・監視・障害対応・コスト管理 |

---

## システム概要

```
技術スタック:
  フロントエンド: Next.js 16 / React 19 / TypeScript / Tailwind CSS v4 / MUI v7
  認証:          Auth.js v5 (next-auth@beta) / Google OAuth 2.0
  天気API:       OpenWeatherMap API
  AI:            Google Gemini 2.5 Flash
  DB:            Supabase (PostgreSQL)
  ホスティング:  Vercel（推奨）

主要機能:
  - Googleアカウントによるログイン
  - 都市名での天気検索（Supabaseの都市リストから選択）
  - GPS（現在地）からの天気検索
  - AI（Gemini）による活動アドバイスと4項目スコア表示
  - レスポンシブデザイン（スマホ・PC対応）
```
